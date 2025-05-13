import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Edit2, Trash2, Medal, Trophy, Timer } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Database } from '../../types/supabase';
import ImageUpload from '../../components/ui/ImageUpload';

type Athlete = Database['public']['Tables']['athletes']['Row'] & {
  specialties: Database['public']['Tables']['specialties']['Row'][];
  records: Database['public']['Tables']['records']['Row'][];
  achievements: Database['public']['Tables']['achievements']['Row'][];
  personal_bests: Database['public']['Tables']['personal_bests']['Row'][];
};

type AthleteForm = {
  name: string;
  image: string;
  sport: string;
  bio: string;
  nationality: string;
  date_of_birth: string;
  club: string;
  coach: string;
  training_base: string;
  specialties: { value: string }[];
  records: { value: string }[];
  achievements: { value: string }[];
  personal_bests: {
    event: string;
    time: string;
    date: string;
    location: string;
  }[];
};

const AdminAthletes: React.FC = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  
  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<AthleteForm>({
    defaultValues: {
      specialties: [{ value: '' }],
      records: [{ value: '' }],
      achievements: [{ value: '' }],
      personal_bests: [{ event: '', time: '', date: '', location: '' }]
    }
  });

  const {
    fields: specialtyFields,
    append: appendSpecialty,
    remove: removeSpecialty
  } = useFieldArray({ control, name: 'specialties' });

  const {
    fields: recordFields,
    append: appendRecord,
    remove: removeRecord
  } = useFieldArray({ control, name: 'records' });

  const {
    fields: achievementFields,
    append: appendAchievement,
    remove: removeAchievement
  } = useFieldArray({ control, name: 'achievements' });

  const {
    fields: personalBestFields,
    append: appendPersonalBest,
    remove: removePersonalBest
  } = useFieldArray({ control, name: 'personal_bests' });

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
          { data: achievements },
          { data: personalBests }
        ] = await Promise.all([
          supabase.from('specialties').select('*').eq('athlete_id', athlete.id),
          supabase.from('records').select('*').eq('athlete_id', athlete.id),
          supabase.from('achievements').select('*').eq('athlete_id', athlete.id),
          supabase.from('personal_bests').select('*').eq('athlete_id', athlete.id)
        ]);

        return {
          ...athlete,
          specialties: specialties || [],
          records: records || [],
          achievements: achievements || [],
          personal_bests: personalBests || []
        };
      }));

      setAthletes(fullAthletes);
    } catch (error) {
      console.error('Error fetching athletes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AthleteForm) => {
    try {
      setIsLoading(true);
      
      const athleteData = {
        name: data.name,
        image: data.image,
        sport: data.sport,
        bio: data.bio,
        nationality: data.nationality,
        date_of_birth: data.date_of_birth,
        club: data.club,
        coach: data.coach,
        training_base: data.training_base
      };

      if (editingAthlete) {
        // Update athlete
        const { error: athleteError } = await supabase
          .from('athletes')
          .update(athleteData)
          .eq('id', editingAthlete.id);
          
        if (athleteError) throw athleteError;

        // Delete existing related records
        await Promise.all([
          supabase.from('specialties').delete().eq('athlete_id', editingAthlete.id),
          supabase.from('records').delete().eq('athlete_id', editingAthlete.id),
          supabase.from('achievements').delete().eq('athlete_id', editingAthlete.id),
          supabase.from('personal_bests').delete().eq('athlete_id', editingAthlete.id)
        ]);

        // Insert new related records
        await Promise.all([
          supabase.from('specialties').insert(
            data.specialties
              .filter(s => s.value.trim())
              .map(s => ({
                athlete_id: editingAthlete.id,
                specialty: s.value.trim()
              }))
          ),
          supabase.from('records').insert(
            data.records
              .filter(r => r.value.trim())
              .map(r => ({
                athlete_id: editingAthlete.id,
                record: r.value.trim()
              }))
          ),
          supabase.from('achievements').insert(
            data.achievements
              .filter(a => a.value.trim())
              .map(a => ({
                athlete_id: editingAthlete.id,
                achievement: a.value.trim()
              }))
          ),
          supabase.from('personal_bests').insert(
            data.personal_bests
              .filter(pb => pb.event.trim() && pb.time.trim())
              .map(pb => ({
                athlete_id: editingAthlete.id,
                ...pb
              }))
          )
        ]);
      } else {
        // Insert new athlete
        const { data: newAthlete, error: athleteError } = await supabase
          .from('athletes')
          .insert([athleteData])
          .select()
          .single();
          
        if (athleteError) throw athleteError;

        // Insert related records
        await Promise.all([
          supabase.from('specialties').insert(
            data.specialties
              .filter(s => s.value.trim())
              .map(s => ({
                athlete_id: newAthlete.id,
                specialty: s.value.trim()
              }))
          ),
          supabase.from('records').insert(
            data.records
              .filter(r => r.value.trim())
              .map(r => ({
                athlete_id: newAthlete.id,
                record: r.value.trim()
              }))
          ),
          supabase.from('achievements').insert(
            data.achievements
              .filter(a => a.value.trim())
              .map(a => ({
                athlete_id: newAthlete.id,
                achievement: a.value.trim()
              }))
          ),
          supabase.from('personal_bests').insert(
            data.personal_bests
              .filter(pb => pb.event.trim() && pb.time.trim())
              .map(pb => ({
                athlete_id: newAthlete.id,
                ...pb
              }))
          )
        ]);
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
    reset({
      name: athlete.name,
      image: athlete.image || '',
      sport: athlete.sport || '',
      bio: athlete.bio || '',
      nationality: athlete.nationality || '',
      date_of_birth: athlete.date_of_birth || '',
      club: athlete.club || '',
      coach: athlete.coach || '',
      training_base: athlete.training_base || '',
      specialties: athlete.specialties.length > 0 
        ? athlete.specialties.map(s => ({ value: s.specialty }))
        : [{ value: '' }],
      records: athlete.records.length > 0
        ? athlete.records.map(r => ({ value: r.record }))
        : [{ value: '' }],
      achievements: athlete.achievements.length > 0
        ? athlete.achievements.map(a => ({ value: a.achievement }))
        : [{ value: '' }],
      personal_bests: athlete.personal_bests.length > 0
        ? athlete.personal_bests.map(pb => ({
            event: pb.event,
            time: pb.time,
            date: pb.date,
            location: pb.location
          }))
        : [{ event: '', time: '', date: '', location: '' }]
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
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                  )}
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
                    onImageRemove={() => setValue('image', '')}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    {...register('date_of_birth')}
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

              {/* Specialties */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Specialties</label>
                  <button
                    type="button"
                    onClick={() => appendSpecialty({ value: '' })}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add Specialty
                  </button>
                </div>
                {specialtyFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mb-2">
                    <input
                      {...register(`specialties.${index}.value`)}
                      placeholder="Enter specialty"
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeSpecialty(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Records */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Records</label>
                  <button
                    type="button"
                    onClick={() => appendRecord({ value: '' })}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add Record
                  </button>
                </div>
                {recordFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mb-2">
                    <input
                      {...register(`records.${index}.value`)}
                      placeholder="Enter record"
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeRecord(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Achievements */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Achievements</label>
                  <button
                    type="button"
                    onClick={() => appendAchievement({ value: '' })}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add Achievement
                  </button>
                </div>
                {achievementFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mb-2">
                    <input
                      {...register(`achievements.${index}.value`)}
                      placeholder="Enter achievement"
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeAchievement(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Personal Bests */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Personal Bests</label>
                  <button
                    type="button"
                    onClick={() => appendPersonalBest({ event: '', time: '', date: '', location: '' })}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add Personal Best
                  </button>
                </div>
                {personalBestFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-md">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Event</label>
                      <input
                        {...register(`personal_bests.${index}.event`)}
                        placeholder="e.g., 100m Freestyle"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Time</label>
                      <input
                        {...register(`personal_bests.${index}.time`)}
                        placeholder="e.g., 52.31"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Date</label>
                      <input
                        type="date"
                        {...register(`personal_bests.${index}.date`)}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Location</label>
                      <input
                        {...register(`personal_bests.${index}.location`)}
                        placeholder="e.g., National Championships"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removePersonalBest(index)}
                        className="text-red-600 hover:text-red-700 md:col-span-4 text-center"
                      >
                        Remove Personal Best
                      </button>
                    )}
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
                    src={athlete.image || 'https://via.placeholder.com/400x300'}
                    alt={athlete.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-semibold">{athlete.name}</h3>
                    <p className="text-sm opacity-90">{athlete.sport}</p>
                  </div>
                </div>
                
                <div className="p-4">
                  {athlete.specialties.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {athlete.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                          >
                            {specialty.specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {athlete.records.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Records</h4>
                      <ul className="space-y-1">
                        {athlete.records.map((record, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <Trophy size={14} className="mr-2 text-yellow-500" />
                            {record.record}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {athlete.achievements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Achievements</h4>
                      <ul className="space-y-1">
                        {athlete.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <Medal size={14} className="mr-2 text-yellow-500" />
                            {achievement.achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

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
                                {pb.time}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(pb.date).toLocaleDateString()} • {pb.location}
                            </div>
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
      </div>
    </AdminLayout>
  );
};

export default AdminAthletes;