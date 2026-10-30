import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const ALL_MODULES = [
  "athletes",
  "technical_staff",
  "registrations",
  "posts",
  "activities",
  "gallery",
  "board",
  "travel",
  "reports",
] as const;

type AdminModuleKey = (typeof ALL_MODULES)[number];

const VALID_ROLES = [
  "super_admin",
  "media_manager",
  "technical_coordinator",
  "safesport_officer",
  "custom",
] as const;

type AdminRole = (typeof VALID_ROLES)[number];

const MAX_BODY_BYTES = 16_384;
const RATE_LIMIT_MAX_WRITES = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ALLOWED_HEADERS =
  "authorization, x-client-info, apikey, content-type, cache-control, pragma, x-supabase-api-version";

function resolveCors(req: Request): { allowed: boolean; headers: Record<string, string> } {
  const baseHeaders: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };

  const origin = req.headers.get("origin");
  if (!origin) {
    return { allowed: true, headers: baseHeaders };
  }

  if (origin === "null") {
    return { allowed: false, headers: baseHeaders };
  }

  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return { allowed: false, headers: baseHeaders };
  }

  const isLocalhost =
    parsed.protocol === "http:" &&
    (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1");
  const isHttps = parsed.protocol === "https:";

  if (!isHttps && !isLocalhost) {
    return { allowed: false, headers: baseHeaders };
  }

  const configuredOrigins = Deno.env.get("ALLOWED_ORIGINS");
  if (configuredOrigins && configuredOrigins.trim().length > 0) {
    const allowlist = configuredOrigins
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (allowlist.length > 0 && !allowlist.includes(origin)) {
      return { allowed: false, headers: baseHeaders };
    }
  }

  return {
    allowed: true,
    headers: {
      ...baseHeaders,
      "Access-Control-Allow-Origin": origin,
    },
  };
}

function jsonResponse(
  status: number,
  payload: Record<string, unknown>,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function validateStrongPassword(password: unknown, email?: string): string | null {
  if (typeof password !== "string") {
    return "Password is required.";
  }
  if (password.length < 10) {
    return "Password must be at least 10 characters long.";
  }
  const utf8Bytes = new TextEncoder().encode(password).length;
  if (utf8Bytes > 72) {
    return "Password must not exceed 72 UTF-8 bytes.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least one symbol.";
  }
  if (email) {
    const localPart = email.split("@")[0]?.trim().toLowerCase() ?? "";
    if (localPart.length >= 3 && password.toLowerCase().includes(localPart)) {
      return "Password must not contain the user's email address prefix.";
    }
  }
  return null;
}

function sanitizePermissions(role: AdminRole, rawPermissions: unknown): AdminModuleKey[] | null {
  if (role === "super_admin") {
    return [...ALL_MODULES];
  }
  if (!Array.isArray(rawPermissions)) {
    return null;
  }
  const validSet = new Set<string>(ALL_MODULES);
  const deduped = Array.from(
    new Set(
      rawPermissions.filter((item): item is AdminModuleKey =>
        typeof item === "string" && validSet.has(item)
      ),
    ),
  );
  if (deduped.length < 1 || deduped.length !== rawPermissions.length) {
    return null;
  }
  return deduped;
}

function getRequestMetadata(req: Request): { ipAddress: string | null; userAgent: string | null } {
  const forwarded = req.headers.get("x-forwarded-for");
  const ipAddress = forwarded
    ? forwarded.split(",")[0]?.trim().slice(0, 64) ?? null
    : req.headers.get("cf-connecting-ip")?.slice(0, 64) ?? null;
  const userAgent = req.headers.get("user-agent")?.slice(0, 256) ?? null;
  return { ipAddress, userAgent };
}

Deno.serve(async (req: Request) => {
  const cors = resolveCors(req);

  if (!cors.allowed) {
    return jsonResponse(403, { ok: false, error: "Forbidden origin." }, cors.headers);
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors.headers });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { ok: false, error: "Method not allowed." }, cors.headers);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    console.error("Missing required Supabase environment variables in manage-users.");
    return jsonResponse(500, { ok: false, error: "Server configuration error." }, cors.headers);
  }

  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return jsonResponse(401, { ok: false, error: "Missing authorization token." }, cors.headers);
  }
  const jwt = authHeader.slice(7).trim();
  if (!jwt) {
    return jsonResponse(401, { ok: false, error: "Invalid authorization token." }, cors.headers);
  }

  let rawBodyText: string;
  try {
    const buffer = await req.arrayBuffer();
    if (buffer.byteLength > MAX_BODY_BYTES) {
      return jsonResponse(413, { ok: false, error: "Request payload too large." }, cors.headers);
    }
    rawBodyText = new TextDecoder().decode(buffer);
  } catch {
    return jsonResponse(400, { ok: false, error: "Unable to read request body." }, cors.headers);
  }

  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(rawBodyText);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return jsonResponse(400, { ok: false, error: "Invalid JSON payload." }, cors.headers);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { ok: false, error: "Malformed JSON payload." }, cors.headers);
  }

  const action = typeof body.action === "string" ? body.action : "";

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user: callerUser },
    error: callerAuthError,
  } = await supabaseAdmin.auth.getUser(jwt);

  if (callerAuthError || !callerUser) {
    return jsonResponse(401, { ok: false, error: "Session expired or invalid. Please sign in again." }, cors.headers);
  }

  const { data: callerProfile, error: callerProfileError } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, role, permissions, is_active, must_change_password")
    .eq("id", callerUser.id)
    .maybeSingle();

  if (callerProfileError || !callerProfile) {
    return jsonResponse(403, { ok: false, error: "Unauthorized: Staff profile not found." }, cors.headers);
  }

  if (!callerProfile.is_active) {
    return jsonResponse(403, { ok: false, error: "Your account has been suspended." }, cors.headers);
  }

  const { ipAddress, userAgent } = getRequestMetadata(req);

  const checkWriteRateLimit = async (): Promise<boolean> => {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error } = await supabaseAdmin
      .from("admin_audit_logs")
      .select("id", { count: "exact", head: true })
      .eq("actor_id", callerUser.id)
      .gte("created_at", windowStart);

    if (error) {
      console.error("Rate limit query failed:", error.message);
      return false;
    }
    return (count ?? 0) < RATE_LIMIT_MAX_WRITES;
  };

  // Self-service mandatory first-login password rotation
  if (action === "complete_password_change") {
    if (!callerProfile.must_change_password) {
      return jsonResponse(
        400,
        { ok: false, error: "Password rotation is not pending for your account." },
        cors.headers,
      );
    }

    if (!(await checkWriteRateLimit())) {
      return jsonResponse(
        429,
        { ok: false, error: "Too many attempts. Please wait a minute and try again." },
        cors.headers,
      );
    }

    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword) {
      return jsonResponse(400, { ok: false, error: "Current temporary password is required." }, cors.headers);
    }
    if (newPassword === currentPassword) {
      return jsonResponse(
        400,
        { ok: false, error: "New password must be different from your temporary password." },
        cors.headers,
      );
    }

    const pwError = validateStrongPassword(newPassword, callerProfile.email);
    if (pwError) {
      return jsonResponse(400, { ok: false, error: pwError }, cors.headers);
    }

    // Verify current password without persisting session state
    const verifyClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: verifyError } = await verifyClient.auth.signInWithPassword({
      email: callerProfile.email,
      password: currentPassword,
    });

    if (verifyError) {
      return jsonResponse(400, { ok: false, error: "Current password is incorrect." }, cors.headers);
    }

    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(callerUser.id, {
      password: newPassword,
    });

    if (authUpdateError) {
      console.error("Failed to rotate user password:", authUpdateError.message);
      return jsonResponse(500, { ok: false, error: "Unable to update password right now." }, cors.headers);
    }

    const nowIso = new Date().toISOString();
    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update({
        must_change_password: false,
        password_reset_at: nowIso,
      })
      .eq("id", callerUser.id);

    if (profileUpdateError) {
      console.error("Failed to clear must_change_password flag:", profileUpdateError.message);
      return jsonResponse(500, { ok: false, error: "Password updated, but profile state sync failed." }, cors.headers);
    }

    await supabaseAdmin.from("admin_audit_logs").insert({
      actor_id: callerUser.id,
      actor_email: callerProfile.email,
      action: "password_self_rotated",
      target_user_id: callerUser.id,
      target_email: callerProfile.email,
      details: { self_service: true },
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return jsonResponse(200, { ok: true, data: { rotated: true } }, cors.headers);
  }

  // All management actions below strictly require a verified, active Super Admin
  if (callerProfile.role !== "super_admin" || callerProfile.must_change_password) {
    return jsonResponse(
      403,
      { ok: false, error: "Forbidden: Active Super Admin privileges are required." },
      cors.headers,
    );
  }

  if (action === "list") {
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, avatar_url, role, permissions, is_active, must_change_password, password_reset_at, created_by, created_at, updated_at")
      .order("created_at", { ascending: true });

    if (profilesError) {
      console.error("Error listing profiles:", profilesError.message);
      return jsonResponse(500, { ok: false, error: "Failed to load staff profiles." }, cors.headers);
    }

    const authMetaMap = new Map<string, { last_sign_in_at: string | null }>();
    let page = 1;
    const perPage = 1000;
    while (page <= 20) {
      const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });
      if (listError) {
        console.error("Error listing auth users:", listError.message);
        break;
      }
      const batch = listData?.users ?? [];
      for (const u of batch) {
        authMetaMap.set(u.id, {
          last_sign_in_at: u.last_sign_in_at ?? null,
        });
      }
      if (batch.length < perPage) {
        break;
      }
      page += 1;
    }

    const mergedUsers = (profiles ?? []).map((p) => ({
      ...p,
      last_sign_in_at: authMetaMap.get(p.id)?.last_sign_in_at ?? null,
    }));

    const { data: auditLogs, error: auditError } = await supabaseAdmin
      .from("admin_audit_logs")
      .select("id, actor_id, actor_email, action, target_user_id, target_email, details, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (auditError) {
      console.error("Error loading audit logs:", auditError.message);
    }

    return jsonResponse(
      200,
      {
        ok: true,
        data: {
          users: mergedUsers,
          auditLogs: auditLogs ?? [],
        },
      },
      cors.headers,
    );
  }

  // Enforce sliding-window write rate limit for all mutating admin actions
  if (!(await checkWriteRateLimit())) {
    return jsonResponse(
      429,
      { ok: false, error: "Rate limit exceeded. Please wait a minute before making further changes." },
      cors.headers,
    );
  }

  if (action === "create") {
    const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const rawRole = typeof body.role === "string" ? body.role : "";
    const requirePasswordChange =
      typeof body.requirePasswordChange === "boolean" ? body.requirePasswordChange : true;

    if (!rawEmail || rawEmail.length > 254 || !EMAIL_REGEX.test(rawEmail)) {
      return jsonResponse(400, { ok: false, error: "Please provide a valid email address." }, cors.headers);
    }
    if (fullName.length < 2 || fullName.length > 120) {
      return jsonResponse(400, { ok: false, error: "Full name must be between 2 and 120 characters." }, cors.headers);
    }
    if (!VALID_ROLES.includes(rawRole as AdminRole)) {
      return jsonResponse(400, { ok: false, error: "Invalid role selected." }, cors.headers);
    }

    const role = rawRole as AdminRole;
    const permissions = sanitizePermissions(role, body.permissions);
    if (!permissions) {
      return jsonResponse(
        400,
        { ok: false, error: "Please select at least one valid module permission." },
        cors.headers,
      );
    }

    const pwError = validateStrongPassword(body.password, rawEmail);
    if (pwError) {
      return jsonResponse(400, { ok: false, error: pwError }, cors.headers);
    }

    const { data: createdAuth, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: rawEmail,
      password: body.password as string,
      email_confirm: true,
      app_metadata: { role, permissions },
      user_metadata: { full_name: fullName },
    });

    if (createAuthError || !createdAuth?.user) {
      const msg = createAuthError?.message?.toLowerCase() ?? "";
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        return jsonResponse(
          409,
          { ok: false, error: "An account with this email address already exists." },
          cors.headers,
        );
      }
      console.error("GoTrue createUser error:", createAuthError?.message);
      return jsonResponse(400, { ok: false, error: "Unable to create user account." }, cors.headers);
    }

    const newUserId = createdAuth.user.id;

    const { data: insertedProfile, error: profileInsertError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: newUserId,
        email: rawEmail,
        full_name: fullName,
        role,
        permissions,
        is_active: true,
        must_change_password: requirePasswordChange,
        created_by: callerUser.id,
      })
      .select("id, email, full_name, avatar_url, role, permissions, is_active, must_change_password, password_reset_at, created_by, created_at, updated_at")
      .single();

    if (profileInsertError) {
      console.error("Profile insert failed; rolling back auth user:", profileInsertError.message);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return jsonResponse(500, { ok: false, error: "Failed to initialize staff profile." }, cors.headers);
    }

    await supabaseAdmin.from("admin_audit_logs").insert({
      actor_id: callerUser.id,
      actor_email: callerProfile.email,
      action: "user_created",
      target_user_id: newUserId,
      target_email: rawEmail,
      details: {
        role,
        permissions,
        must_change_password: requirePasswordChange,
      },
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return jsonResponse(
      201,
      {
        ok: true,
        data: {
          user: {
            ...insertedProfile,
            last_sign_in_at: null,
          },
        },
      },
      cors.headers,
    );
  }

  if (action === "update") {
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const rawRole = typeof body.role === "string" ? body.role : "";

    if (!UUID_REGEX.test(userId)) {
      return jsonResponse(400, { ok: false, error: "Invalid user ID." }, cors.headers);
    }
    if (fullName.length < 2 || fullName.length > 120) {
      return jsonResponse(400, { ok: false, error: "Full name must be between 2 and 120 characters." }, cors.headers);
    }
    if (!VALID_ROLES.includes(rawRole as AdminRole)) {
      return jsonResponse(400, { ok: false, error: "Invalid role selected." }, cors.headers);
    }

    const role = rawRole as AdminRole;
    if (userId === callerUser.id && role !== "super_admin") {
      return jsonResponse(
        400,
        { ok: false, error: "You cannot demote your own Super Admin account." },
        cors.headers,
      );
    }

    const permissions = sanitizePermissions(role, body.permissions);
    if (!permissions) {
      return jsonResponse(
        400,
        { ok: false, error: "Please select at least one valid module permission." },
        cors.headers,
      );
    }

    const { data: existingTarget, error: targetErr } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role, permissions")
      .eq("id", userId)
      .maybeSingle();

    if (targetErr || !existingTarget) {
      return jsonResponse(404, { ok: false, error: "Target staff user not found." }, cors.headers);
    }

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: fullName,
        role,
        permissions,
      })
      .eq("id", userId)
      .select("id, email, full_name, avatar_url, role, permissions, is_active, must_change_password, password_reset_at, created_by, created_at, updated_at")
      .single();

    if (updateError) {
      if (updateError.message.includes("last active Super Admin")) {
        return jsonResponse(
          400,
          { ok: false, error: "Cannot demote the last active Super Admin." },
          cors.headers,
        );
      }
      console.error("Profile update error:", updateError.message);
      return jsonResponse(500, { ok: false, error: "Failed to update staff user." }, cors.headers);
    }

    await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: { role, permissions },
      user_metadata: { full_name: fullName },
    });

    await supabaseAdmin.from("admin_audit_logs").insert({
      actor_id: callerUser.id,
      actor_email: callerProfile.email,
      action: "user_updated",
      target_user_id: userId,
      target_email: existingTarget.email,
      details: {
        previous_role: existingTarget.role,
        new_role: role,
        previous_permissions: existingTarget.permissions,
        new_permissions: permissions,
      },
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return jsonResponse(200, { ok: true, data: { user: updatedProfile } }, cors.headers);
  }

  if (action === "toggle_active") {
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const isActive = body.isActive;

    if (!UUID_REGEX.test(userId) || typeof isActive !== "boolean") {
      return jsonResponse(400, { ok: false, error: "Invalid request parameters." }, cors.headers);
    }

    if (userId === callerUser.id && !isActive) {
      return jsonResponse(400, { ok: false, error: "You cannot suspend your own account." }, cors.headers);
    }

    const { data: existingTarget, error: targetErr } = await supabaseAdmin
      .from("profiles")
      .select("id, email, is_active")
      .eq("id", userId)
      .maybeSingle();

    if (targetErr || !existingTarget) {
      return jsonResponse(404, { ok: false, error: "Target staff user not found." }, cors.headers);
    }

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ is_active: isActive })
      .eq("id", userId)
      .select("id, email, full_name, avatar_url, role, permissions, is_active, must_change_password, password_reset_at, created_by, created_at, updated_at")
      .single();

    if (updateError) {
      if (updateError.message.includes("last active Super Admin")) {
        return jsonResponse(
          400,
          { ok: false, error: "Cannot suspend the last active Super Admin." },
          cors.headers,
        );
      }
      console.error("Toggle active error:", updateError.message);
      return jsonResponse(500, { ok: false, error: "Failed to update account status." }, cors.headers);
    }

    const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: isActive ? "none" : "876000h",
    });

    if (banError) {
      console.error("GoTrue ban_duration sync error:", banError.message);
    }

    await supabaseAdmin.from("admin_audit_logs").insert({
      actor_id: callerUser.id,
      actor_email: callerProfile.email,
      action: isActive ? "user_reactivated" : "user_suspended",
      target_user_id: userId,
      target_email: existingTarget.email,
      details: { is_active: isActive },
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return jsonResponse(200, { ok: true, data: { user: updatedProfile } }, cors.headers);
  }

  if (action === "reset_password") {
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    if (!UUID_REGEX.test(userId)) {
      return jsonResponse(400, { ok: false, error: "Invalid user ID." }, cors.headers);
    }

    const { data: existingTarget, error: targetErr } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("id", userId)
      .maybeSingle();

    if (targetErr || !existingTarget) {
      return jsonResponse(404, { ok: false, error: "Target staff user not found." }, cors.headers);
    }

    const pwError = validateStrongPassword(body.newPassword, existingTarget.email);
    if (pwError) {
      return jsonResponse(400, { ok: false, error: pwError }, cors.headers);
    }

    const mustChange =
      userId === callerUser.id
        ? false
        : typeof body.requirePasswordChange === "boolean"
        ? body.requirePasswordChange
        : true;

    const { error: pwUpdateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: body.newPassword as string,
    });

    if (pwUpdateError) {
      console.error("GoTrue password reset error:", pwUpdateError.message);
      return jsonResponse(500, { ok: false, error: "Failed to reset user password." }, cors.headers);
    }

    const nowIso = new Date().toISOString();
    const { error: profileSyncError } = await supabaseAdmin
      .from("profiles")
      .update({
        password_reset_at: nowIso,
        must_change_password: mustChange,
      })
      .eq("id", userId);

    if (profileSyncError) {
      if (profileSyncError.message.includes("last active Super Admin")) {
        // Keep last active Super Admin immediately usable without mandatory rotation lockout
        await supabaseAdmin
          .from("profiles")
          .update({
            password_reset_at: nowIso,
            must_change_password: false,
          })
          .eq("id", userId);
      } else {
        console.error("Profile password_reset_at sync error:", profileSyncError.message);
      }
    }

    await supabaseAdmin.from("admin_audit_logs").insert({
      actor_id: callerUser.id,
      actor_email: callerProfile.email,
      action: "password_reset",
      target_user_id: userId,
      target_email: existingTarget.email,
      details: { must_change_password: mustChange },
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return jsonResponse(200, { ok: true, data: { reset: true, mustChangePassword: mustChange } }, cors.headers);
  }

  if (action === "delete") {
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    if (!UUID_REGEX.test(userId)) {
      return jsonResponse(400, { ok: false, error: "Invalid user ID." }, cors.headers);
    }

    if (userId === callerUser.id) {
      return jsonResponse(400, { ok: false, error: "You cannot delete your own account." }, cors.headers);
    }

    const { data: existingTarget, error: targetErr } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role")
      .eq("id", userId)
      .maybeSingle();

    if (targetErr || !existingTarget) {
      return jsonResponse(404, { ok: false, error: "Target staff user not found." }, cors.headers);
    }

    // Delete profile first so trg_prevent_last_super_admin_removal runs atomically before GoTrue deletion
    const { error: profileDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileDeleteError) {
      if (profileDeleteError.message.includes("last active Super Admin")) {
        return jsonResponse(
          400,
          { ok: false, error: "Cannot delete the last active Super Admin." },
          cors.headers,
        );
      }
      console.error("Profile delete error:", profileDeleteError.message);
      return jsonResponse(500, { ok: false, error: "Failed to delete staff profile." }, cors.headers);
    }

    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authDeleteError) {
      console.error("GoTrue deleteUser error:", authDeleteError.message);
      return jsonResponse(
        500,
        { ok: false, error: "Staff profile removed, but auth account cleanup encountered an error." },
        cors.headers,
      );
    }

    await supabaseAdmin.from("admin_audit_logs").insert({
      actor_id: callerUser.id,
      actor_email: callerProfile.email,
      action: "user_deleted",
      target_user_id: null,
      target_email: existingTarget.email,
      details: {
        deleted_user_id: userId,
        previous_role: existingTarget.role,
      },
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return jsonResponse(200, { ok: true, data: { deleted: true } }, cors.headers);
  }

  return jsonResponse(400, { ok: false, error: "Unsupported action." }, cors.headers);
});
