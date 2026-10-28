import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { supabase, invalidateCache } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Calendar, Search, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Database } from '../../types/supabase';
import ImageUpload from '../../components/ui/ImageUpload';
import Modal from '../../components/ui/Modal';

type Event = Database['public']['Tables']['events']['Row'];

const AdminActivities: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Event>();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const onSubmit = async (data: Event) => {
    try {
      setIsLoading(true);

      const eventData = {
        title: data.title,
        description: data.description,
        date: data.date,
        category: data.category,
        image: data.image
      };

      let result;
      if (editingEvent) {
        result = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);
      } else {
        result = await supabase
          .from('events')
          .insert([eventData]);
      }

      if (result.error) {
        throw result.error;
      }

      reset();
      setIsAdding(false);
      setEditingEvent(null);
      invalidateCache('event');
      await fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsAdding(true);
    Object.keys(event).forEach((key) => {
      setValue(key as keyof Event, event[key as keyof Event]);
    });
  };

  const handleDeleteClick = (id: string) => {
    setEventToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventToDelete);

      if (error) throw error;
      invalidateCache('event');
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  const filteredEvents = events.filter(event => {
    const q = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(q) ||
      (event.category && event.category.toLowerCase().includes(q)) ||
      (event.description && event.description.toLowerCase().includes(q))
    );
  });

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Activities & Calendar"
        description="Organize aquatic tournaments, coaching clinics, open water meets, and training camps."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Content & Media' },
          { label: 'Activities' }
        ]}
        actions={
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingEvent(null);
              reset();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-xs"
          >
            {isAdding ? <X size={15} /> : <Plus size={15} />}
            <span>{isAdding ? 'Close Editor' : 'Add Activity'}</span>
          </button>
        }
      />

      {/* Editor Drawer / Form Card */}
      {isAdding && (
        <div className="admin-card p-6 mb-8 border-primary-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                {editingEvent ? 'Edit Activity Details' : 'Schedule New Activity'}
              </h3>
              <p className="text-xs text-slate-500">Specify dates, category, and descriptive details for the calendar.</p>
            </div>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingEvent(null);
                reset();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Activity Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sierra Leone National Swimming Championship 2026"
                  {...register('title', { required: 'Title is required' })}
                  className="admin-input"
                />
                {errors.title && (
                  <p className="text-rose-600 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="admin-select"
                >
                  <option value="">Select Category</option>
                  <option value="competition">Competition</option>
                  <option value="training">Training Camp</option>
                  <option value="development">Grassroots Clinic</option>
                  <option value="community">Community Program</option>
                </select>
                {errors.category && (
                  <p className="text-rose-600 text-xs mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Event Date *
                </label>
                <input
                  type="date"
                  {...register('date', { required: 'Date is required' })}
                  className="admin-input"
                />
                {errors.date && (
                  <p className="text-rose-600 text-xs mt-1">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cover Photo
                </label>
                <ImageUpload
                  currentImage={editingEvent?.image}
                  onImageUpload={async (file) => {
                    const url = await uploadImage(file);
                    if (url) setValue('image', url);
                  }}
                  onImageRemove={() => setValue('image', null)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Description & Schedule Details *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                placeholder="Overview of the event, venue location, eligibility, and program schedule..."
                className="admin-input text-xs"
              />
              {errors.description && (
                <p className="text-rose-600 text-xs mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingEvent(null);
                  reset();
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-xs"
              >
                {editingEvent ? 'Save Changes' : 'Schedule Activity'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Container Card */}
      <div className="admin-card overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-50 transition-all"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredEvents.length} of {events.length} {events.length === 1 ? 'activity' : 'activities'}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
            <p className="mt-3 text-xs text-slate-500">Loading activities...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              icon={Calendar}
              title={searchQuery ? 'No matching activities' : 'No activities scheduled yet'}
              description={
                searchQuery
                  ? `No activities match "${searchQuery}". Clear your search or add a new event.`
                  : 'Keep athletes and followers informed by posting upcoming swimming galas and workshops.'
              }
              action={
                !searchQuery && (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus size={14} /> Schedule First Activity
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
                  <th className="px-5 py-3.5">Activity</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm">
                {filteredEvents.map((event) => {
                  const isUpcoming = event.date ? new Date(event.date) >= new Date() : false;
                  return (
                    <tr
                      key={event.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {event.image ? (
                            <img
                              src={event.image}
                              alt={event.title}
                              className="h-10 w-14 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
                              }}
                            />
                          ) : (
                            <div className="h-10 w-14 rounded-lg bg-secondary-50 border border-secondary-100 flex items-center justify-center flex-shrink-0 text-secondary-600">
                              <Calendar size={18} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                              {event.title}
                            </p>
                            {event.description && (
                              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <AdminBadge variant="warning" size="sm">
                          {event.category?.replace('-', ' ') || 'General'}
                        </AdminBadge>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                        {event.date ? new Date(event.date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <AdminBadge variant={isUpcoming ? 'success' : 'neutral'} size="sm">
                          {isUpcoming ? 'Upcoming' : 'Past'}
                        </AdminBadge>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(event)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="Edit activity"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(event.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete activity"
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
          setEventToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Activity"
        message="Are you sure you want to remove this activity from the federation calendar? This action cannot be undone."
        confirmText="Delete Activity"
        cancelText="Cancel"
      />
    </AdminLayout>
  );
};

export default AdminActivities;