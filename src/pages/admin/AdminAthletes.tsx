import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Edit2, Trash2, Medal, Trophy, Timer } from 'lucide-react';
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

  const onSubmit = async (data: Athlete) => {
    try {
      setIsLoading(true);
      
      const athleteData = {
        name: data.name,
        nickname: data.nickname,
        image: data.image,
        sport: data.sport,
        bio: data.bio,
        nationality: data.nationality,
        date_of_birth: data.date_of_birth,
        club: data.club,
        coach: data.coach,
        training_base: data.training_base,
        height_meters: data.height_meters,
        weight_kg: data.weight_kg,
        place_of_birth: data.place_of_birth,
        personal_bests: data.personal_bests
      };

      if (editingAthlete) {
        const { error } = await supabase
          .from('athletes')
          .update(athleteData)
          .eq('id', editingAthlete.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('athletes')
          .insert([athleteData]);
          
        if (error) throw error;
      }

      reset();
      setIsAdding(false);
      setEditingAthlete(null);
      fetchAthletes();
    } catch (error) {
      console.error('Error saving athlete:', error);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this athlete?')) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('athletes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      fetchAthletes();
    } catch (error) {
      console.error('Error deleting athlete:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Manage Athletes</h2>
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingAthlete(null);
              reset();
            }}
            className="btn btn-primary"
          >
            <PlusCircle size={20} className="mr-2" />
            Add Athlete
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4">
              {editingAthlete ? 'Edit Athlete' : 'Add New Athlete'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., OLAMIDAY ELIZABETH SAM"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
                  <input
                    type="text"
                    {...register('nickname')}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., OLY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
                  <select
                    {...register('sport', { required: 'Sport is required' })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select Sport</option>
                    <option value="swimming">Swimming</option>
                    <option value="diving">Diving</option>
                    <option value="water-polo">Water Polo</option>
                  </select>
                  {errors.sport && (
                    <p className="text-red-500 text-xs mt-1">{errors.sport.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <ImageUpload
                    currentImage={editingAthlete?.image}
                    onImageUpload={(url) => setValue('image', url)}
                    onImageRemove={() => setValue('image', null)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height (meters)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('height_meters', {
                      min: { value: 0.5, message: 'Height must be at least 0.5m' },
                      max: { value: 2.5, message: 'Height must be less than 2.5m' }
                    })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., 1.75"
                  />
                  {errors.height_meters && (
                    <p className="text-red-500 text-xs mt-1">{errors.height_meters.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('weight_kg', {
                      min: { value: 30, message: 'Weight must be at least 30kg' },
                      max: { value: 150, message: 'Weight must be less than 150kg' }
                    })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., 65.5"
                  />
                  {errors.weight_kg && (
                    <p className="text-red-500 text-xs mt-1">{errors.weight_kg.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    {...register('date_of_birth')}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth</label>
                  <input
                    type="text"
                    {...register('place_of_birth')}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., Freetown, Sierra Leone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                  <input
                    type="text"
                    {...register('nationality')}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
                  <input
                    type="text"
                    {...register('club')}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coach</label>
                  <input
                    type="text"
                    {...register('coach')}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Training Base</label>
                  <input
                    type="text"
                    {...register('training_base')}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  {...register('bio')}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personal Bests</label>
                <textarea
                  {...register('personal_bests')}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter personal bests (e.g., 100m Freestyle - 48.23s (2024-01-15))"
                ></textarea>
                <p className="text-sm text-gray-500 mt-1">
                  Enter each personal best on a new line in the format: Event - Time in seconds (Date)
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingAthlete(null);
                    reset();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAthlete ? 'Update' : 'Save'} Athlete
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {athletes.map((athlete) => (
              <div key={athlete.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={athlete.image || "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                    alt={athlete.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-semibold">{athlete.name}</h3>
                    {athlete.nickname && (
                      <p className="text-sm opacity-90">"{athlete.nickname}"</p>
                    )}
                    <p className="text-sm opacity-90">{athlete.sport}</p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Height</p>
                      <p className="font-medium">{athlete.height_meters}m</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Weight</p>
                      <p className="font-medium">{athlete.weight_kg}kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Birth Place</p>
                      <p className="font-medium">{athlete.place_of_birth || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nationality</p>
                      <p className="font-medium">{athlete.nationality}</p>
                    </div>
                  </div>

                  {athlete.personal_bests && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Personal Bests</h4>
                      <div className="space-y-2">
                        {athlete.personal_bests.split('\n').map((pb, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded">
                            <div className="text-sm text-gray-600">{pb}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                    <button
                      onClick={() => handleEdit(athlete)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(athlete.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
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
          title="Delete Athlete"
          message="Are you sure you want to delete this athlete? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminAthletes;