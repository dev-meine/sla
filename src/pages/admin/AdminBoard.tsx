import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { supabase, invalidateCache } from '../../lib/supabase';
import {
  Plus,
  Edit2,
  Trash2,
  Users2,
  Search,
  X,
  Mail,
  AlertCircle,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Database } from '../../types/supabase';
import ImageCropUpload from '../../components/ui/ImageCropUpload';
import Modal from '../../components/ui/Modal';
import { sortBoardMembers } from '../../utils/boardOrder';

type BoardMember = Database['public']['Tables']['board_members']['Row'];

const AdminBoard: React.FC = () => {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [savedMembers, setSavedMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);
  const [orderAnnouncement, setOrderAnnouncement] = useState('');
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BoardMember>({
    defaultValues: {
      name: '',
      position: '',
      bio: '',
      image: null,
      display_order: null
    }
  });

  useEffect(() => {
    register('image');
  }, [register]);

  const resetFormState = () => {
    setFormError(null);
    setEditingMember(null);
    reset({
      name: '',
      position: '',
      bio: '',
      image: null,
      display_order: null
    });
  };

  useEffect(() => {
    fetchBoardMembers();
  }, []);

  const fetchBoardMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('board_members')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('name');

      if (error) throw error;
      const sorted = sortBoardMembers(data || []);
      setBoardMembers(sorted);
      setSavedMembers(sorted);
      setHasUnsavedOrder(false);
    } catch (error) {
      console.error('Error fetching board members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    setFormError(null);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${fileExt}`;
      const filePath = `board/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, { contentType: file.type || 'image/webp' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to upload portrait image. Please try again.';
      console.error('Error uploading image:', error);
      setFormError(`Photo upload failed: ${message}`);
      throw new Error(message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const deleteImage = async (imageUrl: string) => {
    try {
      const path = imageUrl.split('/').pop();
      if (!path) return;

      const { error } = await supabase.storage
        .from('images')
        .remove([`board/${path}`]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const onSubmit = async (data: BoardMember) => {
    if (isUploadingImage) return;

    try {
      setIsSaving(true);
      setFormError(null);

      const parsedOrder =
        data.display_order !== null &&
        data.display_order !== undefined &&
        String(data.display_order).trim() !== '' &&
        !Number.isNaN(Number(data.display_order))
          ? Number(data.display_order)
          : null;

      const payload = {
        name: data.name.trim(),
        position: data.position.trim(),
        image: data.image || null,
        bio: data.bio?.trim() || null,
        display_order: parsedOrder
      };

      if (editingMember) {
        if (payload.image !== editingMember.image && editingMember.image) {
          await deleteImage(editingMember.image);
        }

        const { error } = await supabase
          .from('board_members')
          .update(payload)
          .eq('id', editingMember.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('board_members')
          .insert([payload]);

        if (error) throw error;
      }

      resetFormState();
      setIsAdding(false);
      invalidateCache('board');
      await fetchBoardMembers();
    } catch (error) {
      console.error('Error saving board member:', error);
      const message =
        error instanceof Error ? error.message : 'Could not save board member. Please try again.';
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (member: BoardMember) => {
    setFormError(null);
    setEditingMember(member);
    setIsAdding(true);
    reset({
      ...member,
      bio: member.bio || '',
      image: member.image || null
    });
  };

  const handleDeleteClick = (id: string) => {
    setMemberToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;

    try {
      setIsLoading(true);
      const member = boardMembers.find(m => m.id === memberToDelete);
      if (member?.image) {
        await deleteImage(member.image);
      }

      const { error } = await supabase
        .from('board_members')
        .delete()
        .eq('id', memberToDelete);

      if (error) throw error;
      invalidateCache('board');
      fetchBoardMembers();
    } catch (error) {
      console.error('Error deleting board member:', error);
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setMemberToDelete(null);
    }
  };

  useEffect(() => {
    if (!orderNotice) return;
    const timer = window.setTimeout(() => setOrderNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [orderNotice]);

  const canReorder = !searchQuery.trim() && boardMembers.length > 1 && !isSavingOrder;
  const hasCustomOrder = savedMembers.some(
    (member) => typeof member.display_order === 'number' && !Number.isNaN(member.display_order)
  );

  const applyReorder = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= boardMembers.length ||
      toIndex >= boardMembers.length
    ) {
      return;
    }

    const updated = [...boardMembers];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    setBoardMembers(updated);
    setOrderError(null);
    setOrderNotice(null);
    setOrderAnnouncement(`Moved ${moved.name} to position ${toIndex + 1} of ${updated.length}.`);

    const changed = updated.some((member, idx) => member.id !== savedMembers[idx]?.id);
    setHasUnsavedOrder(changed);
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, id: string) => {
    if (!canReorder) return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, id: string) => {
    if (!canReorder || !draggedId || draggedId === id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, targetId: string) => {
    e.preventDefault();
    if (!canReorder || !draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const fromIndex = boardMembers.findIndex((m) => m.id === draggedId);
    const toIndex = boardMembers.findIndex((m) => m.id === targetId);
    applyReorder(fromIndex, toIndex);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleSaveOrder = async () => {
    if (boardMembers.length === 0 || isSavingOrder) return;
    try {
      setIsSavingOrder(true);
      setOrderError(null);
      setOrderNotice(null);

      const results = await Promise.all(
        boardMembers.map((member, index) =>
          supabase
            .from('board_members')
            .update({ display_order: index + 1 })
            .eq('id', member.id)
        )
      );

      const failed = results.find((res) => res.error);
      if (failed?.error) throw failed.error;

      invalidateCache('board');
      await fetchBoardMembers();
      setOrderNotice('Display order saved. The public Executive Board page now uses this exact order.');
    } catch (error) {
      console.error('Error saving board order:', error);
      const message =
        error instanceof Error ? error.message : 'Could not save display order. Please try again.';
      setOrderError(message);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDiscardOrder = () => {
    setBoardMembers(savedMembers);
    setHasUnsavedOrder(false);
    setOrderError(null);
    setOrderAnnouncement('Discarded unsaved display order changes.');
  };

  const handleResetToOfficialOrder = async () => {
    if (boardMembers.length === 0 || isSavingOrder) return;
    try {
      setIsSavingOrder(true);
      setOrderError(null);
      setOrderNotice(null);

      const results = await Promise.all(
        boardMembers.map((member) =>
          supabase
            .from('board_members')
            .update({ display_order: null })
            .eq('id', member.id)
        )
      );

      const failed = results.find((res) => res.error);
      if (failed?.error) throw failed.error;

      invalidateCache('board');
      await fetchBoardMembers();
      setOrderNotice('Reset to official SLA protocol order.');
    } catch (error) {
      console.error('Error resetting board order:', error);
      const message =
        error instanceof Error ? error.message : 'Could not reset order. Please try again.';
      setOrderError(message);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const filteredMembers = boardMembers.filter(member => {
    const q = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(q) ||
      (member.position && member.position.toLowerCase().includes(q)) ||
      (member.bio && member.bio.toLowerCase().includes(q))
    );
  });

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Executive Board"
        description="Manage the federation leadership team, positions, biographies, and executive profiles."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Operations' },
          { label: 'Executive Board' }
        ]}
        actions={
          <button
            type="button"
            onClick={() => {
              const next = !isAdding;
              setIsAdding(next);
              resetFormState();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-xs"
          >
            {isAdding ? <X size={15} /> : <Plus size={15} />}
            <span>{isAdding ? 'Close Editor' : 'Add Board Member'}</span>
          </button>
        }
      />

      {/* Editor Drawer / Form Card */}
      {isAdding && (
        <div className="admin-card p-6 mb-8 border-primary-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                {editingMember ? 'Update Board Member' : 'Appoint New Board Member'}
              </h3>
              <p className="text-xs text-slate-500">Provide executive credentials, position title, and professional profile photo.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                resetFormState();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          {formError && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800"
            >
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-relaxed">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. George Spilsbury"
                  {...register('name', { required: 'Name is required' })}
                  className="admin-input"
                />
                {errors.name && (
                  <p className="text-rose-600 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Position / Executive Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. President, Vice-President, Secretary General"
                  {...register('position', { required: 'Position is required' })}
                  className="admin-input"
                />
                {errors.position && (
                  <p className="text-rose-600 text-xs mt-1">{errors.position.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Display Order (Optional)
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="Auto (official protocol hierarchy)"
                  {...register('display_order')}
                  className="admin-input"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave blank for automatic official protocol order, or drag rows / use arrows in the table below to organize the board visually.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Portrait Photo (Square 1:1)
                </label>
                <ImageCropUpload
                  currentImage={editingMember?.image}
                  onImageUpload={async (file) => {
                    const url = await uploadImage(file);
                    setValue('image', url, { shouldDirty: true });
                  }}
                  onImageRemove={() => setValue('image', null, { shouldDirty: true })}
                  aspectRatio={1}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Executive Biography & Vision
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                placeholder="Background, achievements in aquatic development, and governance role..."
                className="admin-input text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  resetFormState();
                }}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploadingImage}
                className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingImage
                  ? 'Uploading Photo...'
                  : isSaving
                  ? 'Saving...'
                  : editingMember
                  ? 'Save Changes'
                  : 'Appoint Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Container Card */}
      <div className="admin-card overflow-hidden">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {orderAnnouncement}
        </div>

        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, position, or biography..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-50 transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="text-slate-500 font-medium">
              Showing {filteredMembers.length} of {boardMembers.length} executive {boardMembers.length === 1 ? 'officer' : 'officers'}
            </span>
            {boardMembers.length > 1 && (
              <>
                <span className="hidden sm:inline text-slate-300">•</span>
                {hasCustomOrder ? (
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      Custom Order
                    </span>
                    <button
                      type="button"
                      onClick={handleResetToOfficialOrder}
                      disabled={isSavingOrder}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200/80 hover:text-slate-900 transition-colors disabled:opacity-50"
                      title="Clear custom order and restore the official SLA protocol hierarchy"
                    >
                      <RotateCcw size={12} />
                      Reset to Official Order
                    </button>
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                    Official Protocol Order
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Unsaved Order Banner */}
        {hasUnsavedOrder && (
          <div className="px-4 py-3 bg-primary-50/80 border-b border-primary-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs font-medium text-primary-900">
              You have unsaved display order changes. Save to update the order shown on the public Executive Board page.
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleDiscardOrder}
                disabled={isSavingOrder}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveOrder}
                disabled={isSavingOrder}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                <Save size={13} />
                {isSavingOrder ? 'Saving Order...' : 'Save Order'}
              </button>
            </div>
          </div>
        )}

        {/* Order Error Alert */}
        {orderError && (
          <div
            role="alert"
            className="px-4 py-3 bg-rose-50 border-b border-rose-200 flex items-center justify-between gap-3 text-rose-800"
          >
            <div className="flex items-center gap-2 text-xs font-medium">
              <AlertCircle size={15} className="text-rose-600 flex-shrink-0" />
              <span>{orderError}</span>
            </div>
            <button
              type="button"
              onClick={() => setOrderError(null)}
              className="text-rose-500 hover:text-rose-700"
              aria-label="Dismiss error"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Order Success Notice */}
        {orderNotice && (
          <div
            role="status"
            className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between gap-3 text-emerald-800"
          >
            <div className="flex items-center gap-2 text-xs font-medium">
              <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
              <span>{orderNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setOrderNotice(null)}
              className="text-emerald-600 hover:text-emerald-800"
              aria-label="Dismiss notice"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Helper hint when search disables drag-and-drop */}
        {searchQuery.trim() && boardMembers.length > 1 && (
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/70 text-[11px] text-slate-500">
            Clear your search filter to drag rows or use arrows to reorganize the board display order.
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
            <p className="mt-3 text-xs text-slate-500">Loading board members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              icon={Users2}
              title={searchQuery ? 'No matching board members' : 'No board members recorded'}
              description={
                searchQuery
                  ? `No board officers match "${searchQuery}". Clear your search or add a member.`
                  : 'Establish the executive governance directory for Sierra Leone Aquatics.'
              }
              action={
                !searchQuery && (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus size={14} /> Add Board Member
                  </button>
                )
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="pl-4 pr-2 py-3.5 w-32">Order</th>
                  <th className="px-4 py-3.5">Officer</th>
                  <th className="px-4 py-3.5">Executive Role</th>
                  <th className="px-4 py-3.5">Official Contact</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm">
                {filteredMembers.map((member) => {
                  const fullIndex = boardMembers.findIndex((m) => m.id === member.id);
                  const isDragged = draggedId === member.id;
                  const isDropTarget = dragOverId === member.id && draggedId !== member.id;

                  return (
                    <tr
                      key={member.id}
                      draggable={canReorder}
                      onDragStart={(e) => handleDragStart(e, member.id)}
                      onDragOver={(e) => handleDragOver(e, member.id)}
                      onDragLeave={() => {
                        if (dragOverId === member.id) setDragOverId(null);
                      }}
                      onDrop={(e) => handleDrop(e, member.id)}
                      onDragEnd={handleDragEnd}
                      className={`transition-colors group ${
                        isDragged
                          ? 'opacity-50 bg-primary-50/40'
                          : isDropTarget
                          ? 'bg-primary-50/60 ring-2 ring-inset ring-primary-500/60'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`p-1 rounded text-slate-400 ${
                              canReorder
                                ? 'cursor-grab active:cursor-grabbing hover:text-slate-600 hover:bg-slate-100'
                                : 'opacity-30 cursor-not-allowed'
                            }`}
                            title={canReorder ? 'Drag row to reorder' : 'Clear search to reorder'}
                            aria-hidden="true"
                          >
                            <GripVertical size={15} />
                          </span>
                          <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold tabular-nums">
                            {fullIndex + 1}
                          </span>
                          {canReorder && (
                            <div className="flex items-center gap-0.5 ml-0.5">
                              <button
                                type="button"
                                onClick={() => applyReorder(fullIndex, fullIndex - 1)}
                                disabled={fullIndex === 0 || isSavingOrder}
                                className="p-1 rounded text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                                aria-label={`Move ${member.name} up`}
                                title="Move up"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => applyReorder(fullIndex, fullIndex + 1)}
                                disabled={fullIndex === boardMembers.length - 1 || isSavingOrder}
                                className="p-1 rounded text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                                aria-label={`Move ${member.name} down`}
                                title="Move down"
                              >
                                <ArrowDown size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              className="h-11 w-11 rounded-full object-cover border border-slate-200 flex-shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
                              }}
                            />
                          ) : (
                            <div className="h-11 w-11 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0 text-primary-600 font-bold text-sm">
                              {member.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                              {member.name}
                            </p>
                            {member.bio && (
                              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-md">
                                {member.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <AdminBadge variant="info" size="sm">
                          {member.position}
                        </AdminBadge>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5 text-slate-600">
                          <Mail size={13} className="text-slate-400" />
                          {member.position.toLowerCase().replace(/[^a-z0-9]/g, '')}@slsdwa.org
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(member)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="Edit member"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(member.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete member"
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
        )}
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMemberToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Board Member"
        message="Are you sure you want to remove this executive officer from the official board directory? This action cannot be undone."
        confirmText="Delete Member"
        cancelText="Cancel"
      />
    </AdminLayout>
  );
};

export default AdminBoard;