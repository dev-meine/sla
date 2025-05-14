import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Edit2, Trash2, Medal, Trophy, Timer } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Database } from '../../types/supabase';
import ImageUpload from '../../components/ui/ImageUpload';
import Modal from '../../components/ui/Modal';

type Athlete = Database['public']['Tables']['athletes']['Row'] & {
  specialties: Database['public']['Tables']['athlete_specialties']['Row'][];
  records: Database['public']['Tables']['athlete_records']['Row'][];
  personal_bests: Database['public']['Tables']['athlete_personal_bests']['Row'][];
  caps: Database['public']['Tables']['athlete_caps']['Row'][];
};

type PersonalBestInput = {
  event: string;
  time: string;
  date: string;
};

type CapInput = {
  competition_name: string;
  year: number;
  location: string;
};

const AdminAthletes: React.FC = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [athleteToDelete, setAthleteToDelete] = useState<string | null>(null);
  const [personalBests, setPersonalBests] = useState<PersonalBestInput[]>([{ event: '', time: '', date: '' }]);
  const [caps, setCaps] = useState<CapInput[]>([{ competition_name: '', year: new Date().getFullYear(), location: '' }]);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Athlete>();

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const { data: athletesData, error: athletesError } = await supabase
        .from('athletes')
        .select('*')
        .order('name');
      
      if (athletesError) throw athletesError;

      const fullAthletes = await Promise.all((athletesData || []).map(async (athlete) => {
        const [
          { data: specialties },
          { data: records },
          { data: personalBests },
          { data: caps }
        ] = await Promise.all([
          supabase.from('athlete_specialties').select('*').eq('athlete_id', athlete.id),
          supabase.from('athlete_records').select('*').eq('athlete_id', athlete.id),
          supabase.from('athlete_personal_bests').select('*').eq('athlete_id', athlete.id),
          supabase.from('athlete_caps').select('*').eq('athlete_id', athlete.id)
        ]);

        return {
          ...athlete,
          specialties: specialties || [],
          records: records || [],
          personal_bests: personalBests || [],
          caps: caps || []
        };
      }));

      setAthletes(fullAthletes);
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
        place_of_birth: data.place_of_birth
      };

      let athleteId = editingAthlete?.id;

      if (editingAthlete) {
        const { error } = await supabase
          .from('athletes')
          .update(athleteData)
          .eq('id', editingAthlete.id);
          
        if (error) throw error;
      } else {
        const { data: newAthlete, error } = await supabase
          .from('athletes')
          .insert([athleteData])
          .select()
          .single();
          
        if (error) throw error;
        athleteId = newAthlete.id;
      }

      if (athleteId) {
        // Save personal bests
        if (personalBests.length > 0) {
          await supabase
            .from('athlete_personal_bests')
            .delete()
            .eq('athlete_id', athleteId);

          const personalBestsData = personalBests
            .filter(pb => pb.event && pb.time)
            .map(pb => ({
              athlete_id: athleteId,
              event: pb.event,
              time_seconds: parseFloat(pb.time),
              date: pb.date || null
            }));

          if (personalBestsData.length > 0) {
            const { error: pbError } = await supabase
              .from('athlete_personal_bests')
              .insert(personalBestsData);
            
            if (pbError) throw pbError;
          }
        }

        // Save caps
        if (caps.length > 0) {
          await supabase
            .from('athlete_caps')
            .delete()
            .eq('athlete_id', athleteId);

          const capsData = caps
            .filter(cap => cap.competition_name && cap.location)
            .map(cap => ({
              athlete_id: athleteId,
              competition_name: cap.competition_name,
              year: cap.year,
              location: cap.location
            }));

          if (capsData.length > 0) {
            const { error: capsError } = await supabase
              .from('athlete_caps')
              .insert(capsData);
            
            if (capsError) throw capsError;
          }
        }
      }

      reset();
      setIsAdding(false);
      setEditingAthlete(null);
      setPersonalBests([{ event: '', time: '', date: '' }]);
      setCaps([{ competition_name: '', year: new Date().getFullYear(), location: '' }]);
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

    // Set personal bests
    if (athlete.personal_bests && athlete.personal_bests.length > 0) {
      setPersonalBests(athlete.personal_bests.map(pb => ({
        event: pb.event,
        time: pb.time_seconds.toString(),
        date: pb.date || ''
      })));
    } else {
      setPersonalBests([{ event: '', time: '', date: '' }]);
    }

    // Set caps
    if (athlete.caps && athlete.caps.length > 0) {
      setCaps(athlete.caps.map(cap => ({
        competition_name: cap.competition_name,
        year: cap.year,
        location: cap.location
      })));
    } else {
      setCaps([{ competition_name: '', year: new Date().getFullYear(), location: '' }]);
    }
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
      fetchAthletes();
    } catch (error) {
      console.error('Error deleting athlete:', error);
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setAthleteToDelete(null);
    }
  };

  const addPersonalBest = () => {
    setPersonalBests([...personalBests, { event: '', time: '', date: '' }]);
  };

  const removePersonalBest = (index: number) => {
    setPersonalBests(personalBests.filter((_, i) => i !== index));
  };

  const addCap = () => {
    setCaps([...caps, { competition_name: '', year: new Date().getFullYear(), location: '' }]);
  };

  const removeCap = (index: number) => {
    setCaps(caps.filter((_, i) => i !== index));
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
              setPersonalBests([{ event: '', time: '', date: '' }]);
              setCaps([{ competition_name: '', year: new Date().getFullYear(), location: '' }]);
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

              {/* Personal Bests Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">Personal Bests</label>
                  <button
                    type="button"
                    onClick={addPersonalBest}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    + Add Personal Best
                  </button>
                </div>
                {personalBests.map((pb, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <input
                        type="text"
                        value={pb.event}
                        onChange={(e) => {
                          const newPBs = [...personalBests];
                          newPBs[index].event = e.target.value;
                          setPersonalBests(newPBs);
                        }}
                        placeholder="Event (e.g., 100m Freestyle)"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        value={pb.time}
                        onChange={(e) => {
                          const newPBs = [...personalBests];
                          newPBs[index].time = e.target.value;
                          setPersonalBests(newPBs);
                        }}
                        placeholder="Time in seconds"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={pb.date}
                        onChange={(e) => {
                          const newPBs = [...personalBests];
                          newPBs[index].date = e.target.value;
                          setPersonalBests(newPBs);
                        }}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                      {personalBests.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePersonalBest(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Caps Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">International Appearances (Caps)</label>
                  <button
                    type="button"
                    onClick={addCap}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    + Add Cap
                  </button>
                </div>
                {caps.map((cap, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <input
                        type="text"
                        value={cap.competition_name}
                        onChange={(e) => {
                          const newCaps = [...caps];
                          newCaps[index].competition_name = e.target.value;
                          setCaps(newCaps);
                        }}
                        placeholder="Competition Name"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={cap.year}
                        onChange={(e) => {
                          const newCaps = [...caps];
                          newCaps[index].year = parseInt(e.target.value);
                          setCaps(newCaps);
                        }}
                        placeholder="Year"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cap.location}
                        onChange={(e) => {
                          const newCaps = [...caps];
                          newCaps[index].location = e.target.value;
                          setCaps(newCaps);
                        }}
                        placeholder="Location"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                      {caps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCap(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingAthlete(null);
                    reset();
                    setPersonalBests([{ event: '', time: '', date: '' }]);
                    setCaps([{ competition_name: '', year: new Date().getFullYear(), location: '' }]);
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

                  {athlete.personal_bests.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Personal Bests</h4>
                      <div className="space-y-2">
                        {athlete.personal_bests.map((pb, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{pb.event}</span>
                              <span className="text-sm text-primary-600 flex items-center">
                                <Timer size={14} className="mr-1" />
                                {pb.time_seconds}s
                              </span>
                            </div>
                            {pb.date && (
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(pb.date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {athlete.caps.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">International Caps</h4>
                      <ul className="space-y-1">
                        {athlete.caps.map((cap, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <Medal size={14} className="mr-2 text-yellow-500" />
                            {cap.year} {cap.competition_name} ({cap.location})
                          </li>
                        ))}
                      </ul>
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
                      onClick={() => handleDeleteClick(athlete.id)}
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