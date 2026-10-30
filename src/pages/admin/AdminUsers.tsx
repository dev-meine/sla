import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Ban,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit2,
  Eye,
  EyeOff,
  History,
  KeyRound,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import Modal from '../../components/ui/Modal';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import {
  createStaffUser,
  deleteStaffUser,
  listStaffUsers,
  resetStaffPassword,
  toggleStaffActive,
  updateStaffUser,
} from '../../lib/adminUsersApi';
import {
  ALL_ADMIN_MODULES,
  ALL_ADMIN_ROLES,
  generateStrongPassword,
  MODULE_DEFINITIONS,
  ROLE_METADATA,
  ROLE_PRESET_PERMISSIONS,
  validateStrongPassword,
  type AdminModuleKey,
  type AdminRole,
  type AuditLogEntry,
  type StaffProfile,
} from '../../types/rbac';

interface LightDismissDialogProps {
  isOpen: boolean;
  onClose: () => void;
  labelledBy: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}

const LightDismissDialog: React.FC<LightDismissDialogProps> = ({
  isOpen,
  onClose,
  labelledBy,
  maxWidthClass = 'max-w-2xl',
  children,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!('closedBy' in HTMLDialogElement.prototype) && e.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      const clickedOutside =
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom;
      if (clickedOutside) {
        dialog.close();
      }
    }
  };

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={handleBackdropClick}
      className={`w-[calc(100%-2rem)] ${maxWidthClass} m-auto p-0 rounded-2xl bg-white border border-slate-200/90 shadow-2xl backdrop:bg-slate-900/45 backdrop:backdrop-blur-xs text-left open:flex open:flex-col max-h-[90vh]`}
    >
      {isOpen ? children : null}
    </dialog>
  );
};

function formatAuditAction(action: string): {
  label: string;
  variant: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
} {
  switch (action) {
    case 'user_created':
      return { label: 'Account Created', variant: 'success' };
    case 'user_updated':
      return { label: 'Permissions Updated', variant: 'info' };
    case 'user_suspended':
      return { label: 'Account Suspended', variant: 'danger' };
    case 'user_reactivated':
      return { label: 'Account Reactivated', variant: 'success' };
    case 'password_reset':
      return { label: 'Password Reset', variant: 'warning' };
    case 'password_self_rotated':
      return { label: 'Password Rotated', variant: 'neutral' };
    case 'user_deleted':
      return { label: 'Account Deleted', variant: 'danger' };
    default:
      return { label: action, variant: 'neutral' };
  }
}

function areModuleSetsEqual(a: AdminModuleKey[], b: AdminModuleKey[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((item) => setB.has(item));
}

const AdminUsers: React.FC = () => {
  const { profile: currentProfile, refreshProfile } = useAdminAuth();

  const [users, setUsers] = useState<StaffProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AdminRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [showAuditLog, setShowAuditLog] = useState(false);

  // Create / Edit Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedCreatePw, setCopiedCreatePw] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminRole>('media_manager');
  const [selectedPermissions, setSelectedPermissions] = useState<AdminModuleKey[]>(
    ROLE_PRESET_PERMISSIONS.media_manager
  );
  const [requirePasswordChange, setRequirePasswordChange] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSavingForm, setIsSavingForm] = useState(false);

  // Reset Password Modal State
  const [resetTarget, setResetTarget] = useState<StaffProfile | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [showResetPw, setShowResetPw] = useState(false);
  const [copiedResetPw, setCopiedResetPw] = useState(false);
  const [resetRequireChange, setResetRequireChange] = useState(true);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Confirmation Modals State
  const [suspendTarget, setSuspendTarget] = useState<StaffProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffProfile | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  const loadData = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setBannerError(null);
      const result = await listStaffUsers();
      setUsers(result.users);
      setAuditLogs(result.auditLogs);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Failed to load staff accounts.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData(false);
  }, [loadData]);

  const showSuccessToast = (msg: string) => {
    setBannerSuccess(msg);
    window.setTimeout(() => {
      setBannerSuccess((prev) => (prev === msg ? null : prev));
    }, 5000);
  };

  // Filtered staff list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter === 'active' && !u.is_active) return false;
      if (statusFilter === 'suspended' && u.is_active) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const nameMatch = (u.full_name ?? '').toLowerCase().includes(q);
        const emailMatch = u.email.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch) return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  // KPI metrics
  const stats = useMemo(() => {
    const total = users.length;
    const superAdmins = users.filter((u) => u.role === 'super_admin' && u.is_active).length;
    const active = users.filter((u) => u.is_active).length;
    const suspended = users.filter((u) => !u.is_active).length;
    const pendingRotation = users.filter((u) => u.is_active && u.must_change_password).length;
    return { total, superAdmins, active, suspended, pendingRotation };
  }, [users]);

  const openCreateModal = () => {
    setEditingUser(null);
    setFullName('');
    setEmail('');
    const initialPw = generateStrongPassword(16);
    setPassword(initialPw);
    setShowPassword(true);
    setCopiedCreatePw(false);
    setSelectedRole('media_manager');
    setSelectedPermissions([...ROLE_PRESET_PERMISSIONS.media_manager]);
    setRequirePasswordChange(true);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (staff: StaffProfile) => {
    setEditingUser(staff);
    setFullName(staff.full_name ?? '');
    setEmail(staff.email);
    setPassword('');
    setShowPassword(false);
    setCopiedCreatePw(false);
    setSelectedRole(staff.role);
    setSelectedPermissions(
      staff.role === 'super_admin' ? [...ALL_ADMIN_MODULES] : [...staff.permissions]
    );
    setRequirePasswordChange(staff.must_change_password);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleRolePresetSelect = (nextRole: AdminRole) => {
    setSelectedRole(nextRole);
    if (nextRole === 'super_admin') {
      setSelectedPermissions([...ALL_ADMIN_MODULES]);
    } else if (nextRole !== 'custom') {
      setSelectedPermissions([...ROLE_PRESET_PERMISSIONS[nextRole]]);
    }
    setFormError(null);
  };

  const handleToggleModule = (moduleKey: AdminModuleKey) => {
    if (selectedRole === 'super_admin') return;
    setSelectedPermissions((prev) =>
      prev.includes(moduleKey) ? prev.filter((k) => k !== moduleKey) : [...prev, moduleKey]
    );
    setFormError(null);
  };

  const handleGenerateCreatePassword = () => {
    const generated = generateStrongPassword(16);
    setPassword(generated);
    setShowPassword(true);
    setCopiedCreatePw(false);
    setFormError(null);
  };

  const handleCopyCreatePassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopiedCreatePw(true);
      window.setTimeout(() => setCopiedCreatePw(false), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  const handleSaveUserForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2 || trimmedName.length > 120) {
      setFormError('Full name must be between 2 and 120 characters.');
      return;
    }

    const effectivePermissions =
      selectedRole === 'super_admin' ? [...ALL_ADMIN_MODULES] : selectedPermissions;

    if (selectedRole !== 'super_admin' && effectivePermissions.length < 1) {
      setFormError('Select at least one module checkbox for this staff user.');
      return;
    }

    if (!editingUser) {
      if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
        setFormError('Please enter a valid email address.');
        return;
      }
      const pwErr = validateStrongPassword(password, trimmedEmail);
      if (pwErr) {
        setFormError(pwErr);
        return;
      }
    }

    setIsSavingForm(true);
    try {
      if (editingUser) {
        await updateStaffUser({
          userId: editingUser.id,
          fullName: trimmedName,
          role: selectedRole,
          permissions: effectivePermissions,
        });
        if (editingUser.id === currentProfile?.id) {
          await refreshProfile();
        }
        showSuccessToast(`Updated role and permissions for ${editingUser.email}.`);
      } else {
        await createStaffUser({
          email: trimmedEmail,
          fullName: trimmedName,
          password,
          role: selectedRole,
          permissions: effectivePermissions,
          requirePasswordChange,
        });
        showSuccessToast(`Created staff account for ${trimmedEmail}.`);
      }
      setIsFormOpen(false);
      await loadData(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save staff user.');
    } finally {
      setIsSavingForm(false);
    }
  };

  const openResetPasswordModal = (staff: StaffProfile) => {
    setResetTarget(staff);
    const generated = generateStrongPassword(16);
    setResetPasswordValue(generated);
    setShowResetPw(true);
    setCopiedResetPw(false);
    setResetRequireChange(staff.id !== currentProfile?.id);
    setResetError(null);
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setResetError(null);

    const pwErr = validateStrongPassword(resetPasswordValue, resetTarget.email);
    if (pwErr) {
      setResetError(pwErr);
      return;
    }

    setIsResettingPassword(true);
    try {
      await resetStaffPassword({
        userId: resetTarget.id,
        newPassword: resetPasswordValue,
        requirePasswordChange:
          resetTarget.id === currentProfile?.id ? false : resetRequireChange,
      });
      showSuccessToast(`Password reset completed for ${resetTarget.email}.`);
      setResetTarget(null);
      await loadData(true);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleConfirmToggleActive = async () => {
    if (!suspendTarget) return;
    const target = suspendTarget;
    const nextActive = !target.is_active;
    setSuspendTarget(null);
    setActionBusyId(target.id);
    setBannerError(null);
    try {
      await toggleStaffActive({ userId: target.id, isActive: nextActive });
      showSuccessToast(
        nextActive
          ? `Reactivated staff account ${target.email}.`
          : `Suspended ${target.email} and revoked active sessions.`
      );
      await loadData(true);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Failed to update account status.');
    } finally {
      setActionBusyId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    setActionBusyId(target.id);
    setBannerError(null);
    try {
      await deleteStaffUser(target.id);
      showSuccessToast(`Permanently removed staff account ${target.email}.`);
      await loadData(true);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Failed to delete user.');
    } finally {
      setActionBusyId(null);
    }
  };

  const groupedModules = useMemo(() => {
    const groups: Array<'Athletic Roster' | 'Content & Media' | 'Operations'> = [
      'Athletic Roster',
      'Content & Media',
      'Operations',
    ];
    return groups.map((groupName) => ({
      groupName,
      items: MODULE_DEFINITIONS.filter((m) => m.group === groupName),
    }));
  }, []);

  const isEditingSelf = Boolean(editingUser && editingUser.id === currentProfile?.id);
  const hasPresetDrift =
    selectedRole !== 'super_admin' &&
    selectedRole !== 'custom' &&
    !areModuleSetsEqual(selectedPermissions, ROLE_PRESET_PERMISSIONS[selectedRole]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Users & Roles"
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Users & Roles' },
          ]}
          badge={
            <AdminBadge variant="info" size="sm">
              {stats.total} Staff
            </AdminBadge>
          }
          actions={
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => void loadData(true)}
                disabled={isRefreshing || isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                title="Refresh staff list"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-xs"
              >
                <UserPlus size={15} />
                <span>Create Staff Account</span>
              </button>
            </div>
          }
        />

        {/* Feedback Banners */}
        {bannerError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-rose-800">{bannerError}</p>
            </div>
            <button
              type="button"
              onClick={() => setBannerError(null)}
              className="text-rose-400 hover:text-rose-700"
              aria-label="Dismiss error"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {bannerSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-emerald-800">{bannerSuccess}</p>
            </div>
            <button
              type="button"
              onClick={() => setBannerSuccess(null)}
              className="text-emerald-400 hover:text-emerald-700"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* KPI Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="admin-card p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Staff
              </p>
              <p className="text-2xl font-bold text-slate-900 font-heading mt-1">
                {stats.total}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Provisioned accounts</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>

          <div className="admin-card p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Super Admins
              </p>
              <p className="text-2xl font-bold text-slate-900 font-heading mt-1">
                {stats.superAdmins}
              </p>
              <p className="text-[11px] text-primary-600 font-medium mt-1">Full system control</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
          </div>

          <div className="admin-card p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Access
              </p>
              <p className="text-2xl font-bold text-slate-900 font-heading mt-1">
                {stats.active}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                {stats.pendingRotation > 0
                  ? `${stats.pendingRotation} awaiting first sign-in rotation`
                  : 'All active passwords verified'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-700 border border-accent-100 flex items-center justify-center">
              <UserCheck size={18} />
            </div>
          </div>

          <div className="admin-card p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Suspended
              </p>
              <p className="text-2xl font-bold text-slate-900 font-heading mt-1">
                {stats.suspended}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Sessions revoked</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="admin-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff by name or email..."
              className="admin-input pl-9 pr-8 text-xs py-2"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | AdminRole)}
              aria-label="Filter by role"
              className="admin-input text-xs py-2 pr-8 w-auto min-w-[165px]"
            >
              <option value="all">All Roles</option>
              {ALL_ADMIN_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_METADATA[r].label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'suspended')}
              aria-label="Filter by status"
              className="admin-input text-xs py-2 pr-8 w-auto min-w-[140px]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>

        {/* Staff Directory Table */}
        {isLoading ? (
          <div className="admin-card p-12 flex flex-col items-center justify-center text-center">
            <Loader2 size={24} className="animate-spin text-primary-600 mb-3" />
            <p className="text-xs font-semibold text-slate-600">Loading federation staff directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <AdminEmptyState
            icon={Users}
            title="No matching staff accounts"
            description="Adjust your search or role filters, or create a new staff account."
            action={
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus size={14} /> Create Staff Account
              </button>
            }
          />
        ) : (
          <div className="admin-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200/80 text-left">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Staff Member
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Role Preset
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Module Access
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Last Sign-In
                    </th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredUsers.map((staff) => {
                    const isSelf = staff.id === currentProfile?.id;
                    const isBusy = actionBusyId === staff.id;
                    const roleMeta = ROLE_METADATA[staff.role] ?? ROLE_METADATA.custom;
                    const displayName =
                      staff.full_name?.trim() || staff.email.split('@')[0];
                    const initial = displayName.charAt(0).toUpperCase();

                    return (
                      <tr
                        key={staff.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          !staff.is_active ? 'opacity-70 bg-slate-50/40' : ''
                        }`}
                      >
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                staff.role === 'super_admin'
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900 truncate">
                                  {displayName}
                                </span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-primary-50 text-primary-700 border border-primary-200">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
                                <Mail size={11} className="text-slate-400 flex-shrink-0" />
                                <span className="truncate">{staff.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <AdminBadge variant={roleMeta.badgeVariant} size="sm">
                            {roleMeta.shortLabel}
                          </AdminBadge>
                        </td>

                        <td className="px-5 py-4">
                          {staff.role === 'super_admin' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-primary-50/70 text-primary-800 border border-primary-100">
                              <Shield size={12} className="text-primary-600" />
                              All 9 Modules + Users & Roles
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {staff.permissions.slice(0, 3).map((permKey) => {
                                const def = MODULE_DEFINITIONS.find((m) => m.key === permKey);
                                return (
                                  <span
                                    key={permKey}
                                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80"
                                  >
                                    {def?.label ?? permKey}
                                  </span>
                                );
                              })}
                              {staff.permissions.length > 3 && (
                                <span
                                  title={staff.permissions
                                    .map(
                                      (k) =>
                                        MODULE_DEFINITIONS.find((m) => m.key === k)?.label ?? k
                                    )
                                    .join(', ')}
                                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-200/70 text-slate-700 cursor-help"
                                >
                                  +{staff.permissions.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex flex-col items-start gap-1">
                            <AdminBadge
                              variant={staff.is_active ? 'success' : 'danger'}
                              size="sm"
                            >
                              {staff.is_active ? 'Active' : 'Suspended'}
                            </AdminBadge>
                            {staff.is_active && staff.must_change_password && (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                Temp password
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                          {staff.last_sign_in_at
                            ? new Date(staff.last_sign_in_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Never signed in'}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center justify-end gap-1">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => openEditModal(staff)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-40"
                              title="Edit role & module permissions"
                              aria-label={`Edit ${staff.email}`}
                            >
                              <Edit2 size={15} />
                            </button>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => openResetPasswordModal(staff)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40"
                              title="Set / reset password"
                              aria-label={`Reset password for ${staff.email}`}
                            >
                              <KeyRound size={15} />
                            </button>

                            <button
                              type="button"
                              disabled={isSelf || isBusy}
                              onClick={() => setSuspendTarget(staff)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title={
                                isSelf
                                  ? 'You cannot suspend your own account'
                                  : staff.is_active
                                  ? 'Suspend account & revoke sessions'
                                  : 'Reactivate account'
                              }
                              aria-label={
                                staff.is_active
                                  ? `Suspend ${staff.email}`
                                  : `Reactivate ${staff.email}`
                              }
                            >
                              {staff.is_active ? <Ban size={15} /> : <CheckCircle2 size={15} />}
                            </button>

                            <button
                              type="button"
                              disabled={isSelf || isBusy}
                              onClick={() => setDeleteTarget(staff)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title={
                                isSelf
                                  ? 'You cannot delete your own account'
                                  : 'Delete staff account'
                              }
                              aria-label={`Delete ${staff.email}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Collapsible Security Audit Log Viewer */}
        <div className="admin-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAuditLog((prev) => !prev)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                <History size={17} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Security Audit Log
                </h3>
                <p className="text-xs text-slate-500">
                  Immutable record of account creations, role changes, suspensions, and password resets ({auditLogs.length} recent events)
                </p>
              </div>
            </div>
            <div className="text-slate-400">
              {showAuditLog ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </button>

          {showAuditLog && (
            <div className="border-t border-slate-200/80 divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No administrative security events have been recorded yet.
                </div>
              ) : (
                auditLogs.map((entry) => {
                  const meta = formatAuditAction(entry.action);
                  return (
                    <div
                      key={entry.id}
                      className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <AdminBadge variant={meta.variant} size="sm">
                          {meta.label}
                        </AdminBadge>
                        <span className="font-semibold text-slate-900">
                          {entry.actor_email}
                        </span>
                        {entry.target_email && (
                          <>
                            <span className="text-slate-400">→</span>
                            <span className="text-slate-700 font-medium">
                              {entry.target_email}
                            </span>
                          </>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Staff Account Dialog */}
      <LightDismissDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        labelledBy="staff-form-dialog-title"
        maxWidthClass="max-w-2xl"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2
              id="staff-form-dialog-title"
              className="text-lg font-bold text-slate-900 font-heading"
            >
              {editingUser ? 'Edit Staff Role & Module Access' : 'Create Staff Account'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {editingUser
                ? `Update role preset or customize individual module checkboxes for ${editingUser.email}.`
                : 'Provision a verified account, set an initial password, and configure module access.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFormOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveUserForm} className="overflow-y-auto p-6 space-y-6">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-rose-800">{formError}</p>
            </div>
          )}

          {/* Identity Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="staff-full-name"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Full Name
              </label>
              <input
                id="staff-full-name"
                type="text"
                required
                minLength={2}
                maxLength={120}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Mohamed Kamara"
                className="admin-input text-xs py-2.5"
              />
            </div>

            <div>
              <label
                htmlFor="staff-email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Email Address
              </label>
              <input
                id="staff-email"
                type="email"
                required
                spellCheck={false}
                autoComplete="off"
                disabled={Boolean(editingUser)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="official@sierraleoneaquatics.org"
                className="admin-input text-xs py-2.5 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* Direct Password Setup (Create Only) */}
          {!editingUser && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="new-password"
                  className="text-xs font-semibold text-slate-800 uppercase tracking-wider"
                >
                  Initial Password
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateCreatePassword}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    <RefreshCw size={11} />
                    <span>Generate Strong</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyCreatePassword}
                    disabled={!password}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40"
                  >
                    {copiedCreatePw ? (
                      <>
                        <Check size={11} className="text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  id="new-password"
                  name="new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={10}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 10 chars with upper, lower, number & symbol"
                  className="admin-input pr-10 text-xs py-2.5 font-mono bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requirePasswordChange}
                  onChange={(e) => setRequirePasswordChange(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-xs text-slate-600 leading-snug select-none">
                  <strong className="text-slate-800">Require password change on first sign-in</strong>{' '}
                  (recommended so the user sets a private password only they know).
                </span>
              </label>
            </div>
          )}

          {/* Role Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Role Preset
            </label>
            {isEditingSelf && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2.5">
                You are viewing your own Super Admin profile. Self-demotion is disabled to prevent accidental lockout.
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_ADMIN_ROLES.map((roleOption) => {
                const meta = ROLE_METADATA[roleOption];
                const isSelected = selectedRole === roleOption;
                const disabledOption = isEditingSelf && roleOption !== 'super_admin';

                return (
                  <button
                    key={roleOption}
                    type="button"
                    disabled={disabledOption}
                    onClick={() => handleRolePresetSelect(roleOption)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50/60 ring-1 ring-primary-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    } ${disabledOption ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900">{meta.label}</span>
                      {isSelected && (
                        <CheckCircle2 size={14} className="text-primary-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      {meta.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Per-User Module Checkboxes */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div>
                <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Per-User Module Checkboxes
                </span>
                <span className="text-[11px] text-slate-500">
                  {selectedRole === 'super_admin'
                    ? 'Super Administrators automatically receive unrestricted access to every module.'
                    : 'Check or uncheck individual modules to tailor access for this user.'}
                </span>
              </div>

              {selectedRole !== 'super_admin' && (
                <div className="flex items-center gap-2">
                  {hasPresetDrift && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPermissions([...ROLE_PRESET_PERMISSIONS[selectedRole]])
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700"
                    >
                      <RotateCcw size={11} />
                      <span>Reset to preset</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedPermissions([...ALL_ADMIN_MODULES])}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Select all
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPermissions([])}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {groupedModules.map((group) => (
                <div
                  key={group.groupName}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40"
                >
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    {group.groupName}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {group.items.map((mod) => {
                      const isChecked =
                        selectedRole === 'super_admin' ||
                        selectedPermissions.includes(mod.key);
                      const isLocked = selectedRole === 'super_admin';

                      return (
                        <label
                          key={mod.key}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors ${
                            isChecked
                              ? 'bg-white border-primary-200 shadow-2xs'
                              : 'bg-white/60 border-slate-200/70'
                          } ${isLocked ? 'cursor-default' : 'cursor-pointer hover:border-primary-300'}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isLocked}
                            onChange={() => handleToggleModule(mod.key)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 disabled:opacity-60"
                          />
                          <div className="min-w-0">
                            <span className="block text-xs font-semibold text-slate-900 leading-tight">
                              {mod.label}
                            </span>
                            <span className="block text-[10px] text-slate-500 leading-snug mt-0.5">
                              {mod.description}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingForm}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60 shadow-xs"
            >
              {isSavingForm ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingUser ? 'Save Changes' : 'Create Account'}</span>
              )}
            </button>
          </div>
        </form>
      </LightDismissDialog>

      {/* Reset Password Dialog */}
      <LightDismissDialog
        isOpen={Boolean(resetTarget)}
        onClose={() => setResetTarget(null)}
        labelledBy="reset-password-dialog-title"
        maxWidthClass="max-w-md"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2
              id="reset-password-dialog-title"
              className="text-base font-bold text-slate-900 font-heading"
            >
              Reset Staff Password
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[300px]">
              {resetTarget?.email}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setResetTarget(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleConfirmResetPassword} className="p-6 space-y-4">
          {resetError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2">
              <AlertCircle size={15} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-rose-800">{resetError}</p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="reset-new-password"
                className="text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                New Password
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetPasswordValue(generateStrongPassword(16));
                    setShowResetPw(true);
                    setCopiedResetPw(false);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700"
                >
                  <RefreshCw size={11} />
                  <span>Generate</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!resetPasswordValue) return;
                    try {
                      await navigator.clipboard.writeText(resetPasswordValue);
                      setCopiedResetPw(true);
                      window.setTimeout(() => setCopiedResetPw(false), 2000);
                    } catch {
                      // Ignore clipboard error
                    }
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                >
                  {copiedResetPw ? (
                    <>
                      <Check size={11} className="text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                id="reset-new-password"
                name="new-password"
                type={showResetPw ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={10}
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
                className="admin-input pr-10 text-xs py-2.5 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowResetPw((prev) => !prev)}
                aria-label={showResetPw ? 'Hide new password' : 'Show new password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-700"
              >
                {showResetPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              All existing browser sessions for this user will be immediately invalidated.
            </p>
          </div>

          {resetTarget && resetTarget.id !== currentProfile?.id && (
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={resetRequireChange}
                onChange={(e) => setResetRequireChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs text-slate-600 select-none">
                Require user to choose a new personal password on next sign-in
              </span>
            </label>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setResetTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isResettingPassword}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60"
            >
              {isResettingPassword ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </LightDismissDialog>

      {/* Suspend / Reactivate Confirmation Modal */}
      <Modal
        isOpen={Boolean(suspendTarget)}
        onClose={() => setSuspendTarget(null)}
        onConfirm={() => void handleConfirmToggleActive()}
        title={
          suspendTarget?.is_active ? 'Suspend Staff Account?' : 'Reactivate Staff Account?'
        }
        message={
          suspendTarget?.is_active
            ? `Suspending ${suspendTarget.email} will immediately revoke all active sessions and block sign-ins until reactivated.`
            : `Reactivating ${suspendTarget?.email} will restore portal access with their assigned module permissions.`
        }
        confirmText={suspendTarget?.is_active ? 'Suspend Account' : 'Reactivate Account'}
        variant={suspendTarget?.is_active ? 'danger' : 'primary'}
      />

      {/* Delete Staff Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
        title="Delete Staff Account Permanently?"
        message={`This will permanently remove ${deleteTarget?.email} from Sierra Leone Aquatics Admin Portal. Audit log entries will be retained for security compliance.`}
        confirmText="Delete Permanently"
        variant="danger"
      />
    </AdminLayout>
  );
};

export default AdminUsers;
