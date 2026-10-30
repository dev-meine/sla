import { supabase } from './supabase';
import type {
  AdminModuleKey,
  AdminRole,
  AuditLogEntry,
  StaffProfile,
} from '../types/rbac';

interface EdgeEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

async function invokeManageUsers<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<EdgeEnvelope<T>>('manage-users', {
    body,
  });

  if (error) {
    // Extract structured JSON error body when Edge Function returns non-2xx HTTP status
    const maybeContext = (error as { context?: Response }).context;
    if (maybeContext && typeof maybeContext.json === 'function') {
      try {
        const parsed = (await maybeContext.clone().json()) as { error?: string };
        if (parsed?.error) {
          throw new Error(parsed.error);
        }
      } catch (innerErr) {
        if (innerErr instanceof Error && innerErr.message && innerErr !== error) {
          // Only rethrow if it was our parsed server message, not a JSON syntax error
          if (!innerErr.message.toLowerCase().includes('json')) {
            throw innerErr;
          }
        }
      }
    }
    throw new Error(error.message || 'Unable to reach user management service.');
  }

  if (!data || !data.ok) {
    throw new Error(data?.error || 'Request failed.');
  }

  return data.data as T;
}

export async function listStaffUsers(): Promise<{
  users: StaffProfile[];
  auditLogs: AuditLogEntry[];
}> {
  return invokeManageUsers<{ users: StaffProfile[]; auditLogs: AuditLogEntry[] }>({
    action: 'list',
  });
}

export async function createStaffUser(payload: {
  email: string;
  fullName: string;
  password: string;
  role: AdminRole;
  permissions: AdminModuleKey[];
  requirePasswordChange: boolean;
}): Promise<{ user: StaffProfile }> {
  return invokeManageUsers<{ user: StaffProfile }>({
    action: 'create',
    ...payload,
  });
}

export async function updateStaffUser(payload: {
  userId: string;
  fullName: string;
  role: AdminRole;
  permissions: AdminModuleKey[];
}): Promise<{ user: StaffProfile }> {
  return invokeManageUsers<{ user: StaffProfile }>({
    action: 'update',
    ...payload,
  });
}

export async function toggleStaffActive(payload: {
  userId: string;
  isActive: boolean;
}): Promise<{ user: StaffProfile }> {
  return invokeManageUsers<{ user: StaffProfile }>({
    action: 'toggle_active',
    ...payload,
  });
}

export async function resetStaffPassword(payload: {
  userId: string;
  newPassword: string;
  requirePasswordChange: boolean;
}): Promise<{ reset: boolean; mustChangePassword: boolean }> {
  return invokeManageUsers<{ reset: boolean; mustChangePassword: boolean }>({
    action: 'reset_password',
    ...payload,
  });
}

export async function completeOwnPasswordChange(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ rotated: boolean }> {
  return invokeManageUsers<{ rotated: boolean }>({
    action: 'complete_password_change',
    ...payload,
  });
}

export async function deleteStaffUser(userId: string): Promise<{ deleted: boolean }> {
  return invokeManageUsers<{ deleted: boolean }>({
    action: 'delete',
    userId,
  });
}
