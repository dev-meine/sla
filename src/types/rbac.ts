export const ALL_ADMIN_MODULES = [
  'athletes',
  'technical_staff',
  'registrations',
  'posts',
  'activities',
  'gallery',
  'board',
  'travel',
  'reports',
] as const;

export type AdminModuleKey = (typeof ALL_ADMIN_MODULES)[number];

export const ALL_ADMIN_ROLES = [
  'super_admin',
  'media_manager',
  'technical_coordinator',
  'safesport_officer',
  'custom',
] as const;

export type AdminRole = (typeof ALL_ADMIN_ROLES)[number];

export interface ModuleDefinition {
  key: AdminModuleKey;
  label: string;
  description: string;
  group: 'Athletic Roster' | 'Content & Media' | 'Operations';
  path: string;
}

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    key: 'athletes',
    label: 'Athletes Roster',
    description: 'National athletes, specialties, caps, personal bests & records',
    group: 'Athletic Roster',
    path: '/admin/athletes',
  },
  {
    key: 'technical_staff',
    label: 'Technical Staff',
    description: 'Coaches, referees, medical & technical officials',
    group: 'Athletic Roster',
    path: '/admin/technical-staff',
  },
  {
    key: 'registrations',
    label: 'Swimming Registrations',
    description: 'Learn-to-swim applicants, packages & reschedule requests',
    group: 'Athletic Roster',
    path: '/admin/registrations',
  },
  {
    key: 'posts',
    label: 'News Posts',
    description: 'Press releases, articles & official federation announcements',
    group: 'Content & Media',
    path: '/admin/posts',
  },
  {
    key: 'activities',
    label: 'Activities & Events',
    description: 'Competitions, clinics & national aquatic calendar',
    group: 'Content & Media',
    path: '/admin/activities',
  },
  {
    key: 'gallery',
    label: 'Media Gallery',
    description: 'Federation photo albums & competition video embeds',
    group: 'Content & Media',
    path: '/admin/gallery',
  },
  {
    key: 'board',
    label: 'Executive Board',
    description: 'Executive committee & federation leadership profiles',
    group: 'Operations',
    path: '/admin/board',
  },
  {
    key: 'travel',
    label: 'Travel & Ferry',
    description: 'Delegation trips, flights & Sea Coach ferry schedules',
    group: 'Operations',
    path: '/admin/travel',
  },
  {
    key: 'reports',
    label: 'Safe Sport Reports',
    description: 'Confidential athlete welfare & safeguarding submissions',
    group: 'Operations',
    path: '/admin/reports',
  },
];

export const ROLE_PRESET_PERMISSIONS: Record<AdminRole, AdminModuleKey[]> = {
  super_admin: [...ALL_ADMIN_MODULES],
  media_manager: ['posts', 'activities', 'gallery'],
  technical_coordinator: ['athletes', 'technical_staff', 'registrations', 'travel'],
  safesport_officer: ['reports'],
  custom: [],
};

export interface RoleMetadata {
  role: AdminRole;
  label: string;
  shortLabel: string;
  description: string;
  badgeVariant: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
}

export const ROLE_METADATA: Record<AdminRole, RoleMetadata> = {
  super_admin: {
    role: 'super_admin',
    label: 'Super Administrator',
    shortLabel: 'Super Admin',
    description: 'Unrestricted access to all 9 modules plus Users & Roles management.',
    badgeVariant: 'info',
  },
  media_manager: {
    role: 'media_manager',
    label: 'Media Manager',
    shortLabel: 'Media Manager',
    description: 'Defaults to News Posts, Activities/Events, and Media Gallery (customizable).',
    badgeVariant: 'success',
  },
  technical_coordinator: {
    role: 'technical_coordinator',
    label: 'Technical Coordinator',
    shortLabel: 'Tech Coordinator',
    description: 'Defaults to Athletes, Technical Staff, Registrations, and Travel & Ferry (customizable).',
    badgeVariant: 'warning',
  },
  safesport_officer: {
    role: 'safesport_officer',
    label: 'SafeSport Officer',
    shortLabel: 'SafeSport Officer',
    description: 'Defaults to confidential Safe Sport Reports (customizable).',
    badgeVariant: 'danger',
  },
  custom: {
    role: 'custom',
    label: 'Custom Staff Access',
    shortLabel: 'Custom Role',
    description: 'Hand-picked combination of module permissions tailored to this staff member.',
    badgeVariant: 'neutral',
  },
};

export interface StaffProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AdminRole;
  permissions: AdminModuleKey[];
  is_active: boolean;
  must_change_password: boolean;
  password_reset_at: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_sign_in_at?: string | null;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  actor_email: string;
  action: string;
  target_user_id: string | null;
  target_email: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export function validateStrongPassword(password: string, email?: string): string | null {
  if (!password || password.length < 10) {
    return 'Password must be at least 10 characters long.';
  }
  const utf8Bytes = new TextEncoder().encode(password).length;
  if (utf8Bytes > 72) {
    return 'Password must not exceed 72 UTF-8 bytes.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Include at least one uppercase letter (A–Z).';
  }
  if (!/[a-z]/.test(password)) {
    return 'Include at least one lowercase letter (a–z).';
  }
  if (!/[0-9]/.test(password)) {
    return 'Include at least one number (0–9).';
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Include at least one symbol (e.g. !@#$%^&*).';
  }
  if (email) {
    const localPart = email.split('@')[0]?.trim().toLowerCase() ?? '';
    if (localPart.length >= 3 && password.toLowerCase().includes(localPart)) {
      return 'Password must not contain the user’s email prefix.';
    }
  }
  return null;
}

function secureRandomIndex(maxExclusive: number): number {
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - ((maxUint32 + 1) % maxExclusive);
  const buf = new Uint32Array(1);
  let value = 0;
  do {
    window.crypto.getRandomValues(buf);
    value = buf[0];
  } while (value > limit);
  return value % maxExclusive;
}

/**
 * Generates a cryptographically strong password using Web Crypto CSPRNG
 * guaranteed to satisfy uppercase, lowercase, digit, symbol, and 72-byte rules.
 */
export function generateStrongPassword(length = 16): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*-_=+?';
  const all = upper + lower + digits + symbols;

  const safeLength = Math.min(Math.max(length, 12), 32);
  const chars: string[] = [
    upper[secureRandomIndex(upper.length)],
    lower[secureRandomIndex(lower.length)],
    digits[secureRandomIndex(digits.length)],
    symbols[secureRandomIndex(symbols.length)],
  ];

  while (chars.length < safeLength) {
    chars.push(all[secureRandomIndex(all.length)]);
  }

  // Fisher-Yates shuffle with rejection-sampled CSPRNG
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = secureRandomIndex(i + 1);
    const tmp = chars[i];
    chars[i] = chars[j];
    chars[j] = tmp;
  }

  return chars.join('');
}
