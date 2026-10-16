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
  Calendar,
  MapPin,
  Medal,
  Users,
  Search,
  X,
  Trophy,
  Filter
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Database } from '../../types/supabase';
import ImageUpload from '../../components/ui/ImageUpload';
import Modal from '../../components/ui/Modal';

type Athlete = Database['public']['Tables']['athletes']['Row'];

const AdminAthletes: React.FC = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [athleteToDelete, setAthleteToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Athlete>();

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const { data, error } = await supabase
        .from('athletes')
        .select('*')
        .order('name');

      if (error) throw error;
      setAthletes(data || []);
    } catch (error) {
      console.error('Error fetching athletes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `athletes/${fileName}`;

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

  const deleteImage = async (imageUrl: string) => {
    try {
      const path = imageUrl.split('/').pop();
      if (!path) return;

      const { error } = await supabase.storage
        .from('images')
        .remove([`athletes/${path}`]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const sanitizeText = (text: string | null): string | null => {
    if (!text) return null;
    return text.replace(/\0/g, '').trim();
  };

  const onSubmit = async (data: Athlete) => {
    try {
      setIsLoading(true);

      const athleteData = {
        name: sanitizeText(data.name),
        nickname: sanitizeText(data.nickname),
        image: data.image || null,
        sport: sanitizeText(data.sport),
        bio: sanitizeText(data.bio),
        nationality: sanitizeText(data.nationality),
        date_of_birth: data.date_of_birth || null,
        club: sanitizeText(data.club),
        coach: sanitizeText(data.coach),
        training_base: sanitizeText(data.training_base),
        height_meters: data.height_meters ? Number(data.height_meters) : null,
        weight_kg: data.weight_kg ? Number(data.weight_kg) : null,
        place_of_birth: sanitizeText(data.place_of_birth),
        personal_bests: sanitizeText(data.personal_bests),
        specialties: sanitizeText(data.specialties),
        caps: sanitizeText(data.caps)
      };

      if (editingAthlete) {
        const { error } = await supabase
          .from('athletes')
          .update(athleteData)
          .eq('id', editingAthlete.id);

        if (error) {
          alert(`Error updating athlete: ${error.message}`);
          return;
        }
      } else {
        const { error } = await supabase
          .from('athletes')
          .insert([athleteData]);

        if (error) {
          alert(`Error saving athlete: ${error.message}`);
          return;
        }
      }

      reset();
      setIsAdding(false);
      setEditingAthlete(null);
      invalidateCache('athlete');
      fetchAthletes();
    } catch (error) {
      console.error('Error saving athlete:', error);
      alert(`Unexpected error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    setIsAdding(true);
    Object.keys(athlete).forEach((key) => {
      setValue(key as keyof Athlete, athlete[key as keyof Athlete]);
    });
  };

  const handleDeleteClick = (id: string) => {
    setAthleteToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!athleteToDelete) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('athletes')
        .delete()
        .eq('id', athleteToDelete);

      if (error) throw error;
      invalidateCache('athlete');
      fetchAthletes();
    } catch (error) {
      console.error('Error deleting athlete:', error);
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setAthleteToDelete(null);
    }
  };

  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch =
      athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (athlete.training_base && athlete.training_base.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (athlete.club && athlete.club.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSport =
      selectedSport === 'all' ||
      (athlete.sport && athlete.sport.toLowerCase().includes(selectedSport.toLowerCase()));

    return matchesSearch && matchesSport;
  });

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Athletic Roster"
        description="Manage verified national competitors, training bases, specialties, and international caps."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Athletic Roster' },
          { label: 'Athletes' }
        ]}
        actions={
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingAthlete(null);
              reset();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-xs"
          >
            {isAdding ? <X size={15} /> : <Plus size={15} />}
            <span>{isAdding ? 'Close Editor' : 'Register Athlete'}</span>
          </button>
        }
      />

      {/* Editor Drawer / Form Card */}
      {isAdding && (
        <div className="admin-card p-6 mb-8 border-primary-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                {editingAthlete ? 'Update Athlete Profile' : 'Register New Athlete'}
              </h3>
              <p className="text-xs text-slate-500">Provide official biometric data, club details, and competitive history.</p>
            </div>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingAthlete(null);
                reset();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Joshua Wyse"
                  {...register('name', { required: 'Name is required' })}
                  className="admin-input"
                />
                {errors.name && (
                  <p className="text-rose-600 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nickname / Alias
                </label>
                <input
                  type="text"
                  placeholder='e.g. "The Torpedo"'
                  {...register('nickname')}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Sport / Discipline *
                </label>
                <select
                  {...register('sport', { required: 'Sport is required' })}
                  className="admin-select"
                >
                  <option value="">Select Discipline</option>
                  <option value="swimming">Swimming</option>
                  <option value="diving">Diving</option>
                  <option value="water-polo">Water Polo</option>
                  <option value="open-water">Open Water Swimming</option>
                </select>
                {errors.sport && (
                  <p className="text-rose-600 text-xs mt-1">{errors.sport.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  {...register('date_of_birth')}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nationality
                </label>
                <input
                  type="text"
                  defaultValue="Sierra Leonean"
                  {...register('nationality')}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Club
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aberdeen Aquatics Club"
                  {...register('club')}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assigned Coach
                </label>
                <input
                  type="text"
                  placeholder="e.g. Coach Mohamed Kamara"
                  {...register('coach')}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Training Base
                </label>
                <input
                  type="text"
                  placeholder="e.g. Siaka Stevens Stadium Olympic Pool"
                  {...register('training_base')}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Place of Birth
                </label>
                <input
                  type="text"
                  placeholder="e.g. Freetown, Sierra Leone"
                  {...register('place_of_birth')}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Height (Meters)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1.82"
                  {...register('height_meters')}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Weight (KG)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 74.5"
                  {...register('weight_kg')}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Profile Photo
                </label>
                <ImageUpload
                  currentImage={editingAthlete?.image}
                  onImageUpload={async (file) => {
                    const url = await uploadImage(file);
                    if (url) setValue('image', url);
                  }}
                  onImageRemove={() => setValue('image', null)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Specialties (one per line)
                </label>
                <textarea
                  {...register('specialties')}
                  rows={3}
                  placeholder="50m Freestyle&#10;100m Butterfly"
                  className="admin-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Personal Bests (one per line)
                </label>
                <textarea
                  {...register('personal_bests')}
                  rows={3}
                  placeholder="50m Free - 24.12s&#10;100m Free - 53.40s"
                  className="admin-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  International Caps & Medals
                </label>
                <textarea
                  {...register('caps')}
                  rows={3}
                  placeholder="2024 Olympic Games (Paris)&#10;2026 Commonwealth Games"
                  className="admin-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Biography & Athletic Career Overview
              </label>
              <textarea
                {...register('bio')}
                rows={3}
                placeholder="Background, early swimming career, and major milestones..."
                className="admin-input text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingAthlete(null);
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
                {editingAthlete ? 'Update Athlete' : 'Save Athlete'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="admin-card p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by athlete name, club, or training base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-50 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'swimming', 'diving', 'water-polo'].map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                selectedSport === sport
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {sport === 'all' ? 'All Disciplines' : sport.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Athletes Cards Grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-xs text-slate-500">Loading athletic roster...</p>
        </div>
      ) : filteredAthletes.length === 0 ? (
        <div className="admin-card p-8">
          <AdminEmptyState
            icon={Users}
            title={searchQuery || selectedSport !== 'all' ? 'No athletes match filter' : 'No athletes registered'}
            description={
              searchQuery || selectedSport !== 'all'
                ? 'Try adjusting your search criteria or discipline filter.'
                : 'Start building the national aquatic database by registering your first athlete.'
            }
            action={
              !searchQuery && selectedSport === 'all' && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={14} /> Register Athlete
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAthletes.map((athlete) => (
            <div
              key={athlete.id}
              className="admin-card admin-card-hover overflow-hidden flex flex-col group"
            >
              {/* Photo & Hero Header */}
              <div className="relative h-64 overflow-hidden bg-slate-100">
                <img
                  src={
                    athlete.image ||
                    'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
                  }
                  alt={athlete.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-3 left-3">
                  <AdminBadge variant="info" size="sm">
                    {athlete.sport?.replace('-', ' ') || 'Athlete'}
                  </AdminBadge>
                </div>

                {/* Bottom Overlay Title */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-lg font-bold font-heading leading-tight drop-shadow-sm">
                    {athlete.name}
                  </h3>
                  {athlete.nickname && (
                    <p className="text-xs text-slate-200 italic mt-0.5">"{athlete.nickname}"</p>
                  )}
                </div>
              </div>

              {/* Bio & Details Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                    <span>
                      Born:{' '}
                      <strong className="text-slate-900 font-medium">
                        {athlete.date_of_birth
                          ? new Date(athlete.date_of_birth).toLocaleDateString()
                          : 'N/A'}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">
                      Base:{' '}
                      <strong className="text-slate-900 font-medium">
                        {athlete.training_base || 'Unspecified'}
                      </strong>
                    </span>
                  </div>

                  {athlete.specialties && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Specialties
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {athlete.specialties.split('\n').slice(0, 3).map((spec, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {athlete.caps && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        International Caps
                      </p>
                      <p className="text-xs text-slate-700 line-clamp-1 flex items-center gap-1.5">
                        <Medal size={13} className="text-secondary-500 flex-shrink-0" />
                        {athlete.caps.split('\n')[0]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {athlete.club || 'National Roster'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(athlete)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      title="Edit athlete"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(athlete.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete athlete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAthleteToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Athlete Record"
        message="Are you sure you want to remove this athlete from the national registry? This action will permanently remove their profile and records."
        confirmText="Delete Record"
        cancelText="Cancel"
      />
    </AdminLayout>
  );
};

export default AdminAthletes;