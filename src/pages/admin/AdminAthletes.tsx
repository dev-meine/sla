import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Edit2, Trash2, Medal, Trophy, Timer } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Database } from '../../types/supabase';
import ImageUpload from '../../components/ui/ImageUpload';
import Modal from '../../components/ui/Modal';

type Athlete = Database['public']['Tables']['athletes']['Row'] & {
  specialties: Database['public']['Tables']['athlete_specialties']['Row'][];
  records: Database['public']['Tables']['athlete_records']['Row'][];
  personal_bests: Database['public']['Tables']['athlete_personal_bests']['Row'][];
  caps: Database['public']['Tables']['athlete_caps']['Row'][];
};

type AthleteForm = {
  name: string;
  nickname: string;
  image: string | null;
  sport: string;
  bio: string;
  nationality: string;
  date_of_birth: string;
  club: string;
  coach: string;
  training_base: string;
  height_meters: number;
  weight_kg: number;
  place_of_birth: string;
  specialties: { specialty: string }[];
  records: { record: string, date: string }[];
  personal_bests: { value: string }[];
  caps: {
    competition_name: string;
    year: number;
    location: string;
  }[];
};

const AdminAthletes: React.FC = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [athleteToDelete, setAthleteToDelete] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<AthleteForm>({
    defaultValues: {
      specialties: [{ specialty: '' }],
      records: [{ record: '', date: '' }],
      personal_bests: [{ value: '' }],
      caps: [{ competition_name: '', year: new Date().getFullYear(), location: '' }]
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
    fields: personalBestFields,
    append: appendPersonalBest,
    remove: removePersonalBest
  } = useFieldArray({ control, name: 'personal_bests' });

  const {
    fields: capFields,
    append: appendCap,
    remove: removeCap
  } = useFieldArray({ control, name: 'caps' });

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

  const onSubmit = async (data: AthleteForm) => {
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

      if (editingAthlete) {
        const { error: athleteError } = await supabase
          .from('athletes')
          .update(athleteData)
          .eq('id', editingAthlete.id);
          
        if (athleteError) throw athleteError;

        await Promise.all([
          supabase.from('athlete_specialties').delete().eq('athlete_id', editingAthlete.id),
          supabase.from('athlete_records').delete().eq('athlete_id', editingAthlete.id),
          supabase.from('athlete_personal_bests').delete().eq('athlete_id', editingAthlete.id),
          supabase.from('athlete_caps').delete().eq('athlete_id', editingAthlete.id)
        ]);

        await Promise.all([
          supabase.from('athlete_specialties').insert(
            data.specialties
              .filter(s => s.specialty.trim())
              .map(s => ({
                athlete_id: editingAthlete.id,
                specialty: s.specialty.trim()
              }))
          ),
          supabase.from('athlete_records').insert(
            data.records
              .filter(r => r.record.trim())
              .map(r => ({
                athlete_id: editingAthlete.id,
                record: r.record.trim(),
                date: r.date
              }))
          ),
          supabase.from('athlete_personal_bests').insert(
            data.personal_bests
              .filter(pb => pb.value.trim())
              .map(pb => ({
                athlete_id: editingAthlete.id,
                event: pb.value.trim()
              }))
          ),
          supabase.from('athlete_caps').insert(
            data.caps
              .filter(c => c.competition_name.trim())
              .map(c => ({
                athlete_id: editingAthlete.id,
                competition_name: c.competition_name.trim(),
                year: c.year,
                location: c.location.trim()
              }))
          )
        ]);
      } else {
        const { data: newAthlete, error: athleteError } = await supabase
          .from('athletes')
          .insert([athleteData])
          .select()
          .single();
          
        if (athleteError) throw athleteError;

        await Promise.all([
          supabase.from('athlete_specialties').insert(
            data.specialties
              .filter(s => s.specialty.trim())
              .map(s => ({
                athlete_id: newAthlete.id,
                specialty: s.specialty.trim()
              }))
          ),
          supabase.from('athlete_records').insert(
            data.records
              .filter(r => r.record.trim())
              .map(r => ({
                athlete_id: newAthlete.id,
                record: r.record.trim(),
                date: r.date
              }))
          ),
          supabase.from('athlete_personal_bests').insert(
            data.personal_bests
              .filter(pb => pb.value.trim())
              .map(pb => ({
                athlete_id: newAthlete.id,
                event: pb.value.trim()
              }))
          ),
          supabase.from('athlete_caps').insert(
            data.caps
              .filter(c => c.competition_name.trim())
              .map(c => ({
                athlete_id: newAthlete.id,
                competition_name: c.competition_name.trim(),
                year: c.year,
                location: c.location.trim()
              }))
          )
        ]);
      }

      reset();
      setIsAdding(false);
      setEditingAthlete(null);
      await fetchAthletes();
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
      nickname: athlete.nickname || '',
      image: athlete.image,
      sport: athlete.sport || '',
      bio: athlete.bio || '',
      nationality: athlete.nationality || '',
      date_of_birth: athlete.date_of_birth || '',
      club: athlete.club || '',
      coach: athlete.coach || '',
      training_base: athlete.training_base || '',
      height_meters: athlete.height_meters || 0,
      weight_kg: athlete.weight_kg || 0,
      place_of_birth: athlete.place_of_birth || '',
      specialties: athlete.specialties.length > 0 
        ? athlete.specialties.map(s => ({ specialty: s.specialty }))
        : [{ specialty: '' }],
      records: athlete.records.length > 0
        ? athlete.records.map(r => ({ record: r.record, date: r.date || '' }))
        : [{ record: '', date: '' }],
      personal_bests: athlete.personal_bests.length > 0
        ? athlete.personal_bests.map(pb => ({ value: pb.event }))
        : [{ value: '' }],
      caps: athlete.caps.length > 0
        ? athlete.caps.map(c => ({
            competition_name: c.competition_name,
            year: c.year,
            location: c.location
          }))
        : [{ competition_name: '', year: new Date().getFullYear(), location: '' }]
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
      await fetchAthletes();
    } catch (error) {
      console.error('Error deleting athlete:', error);
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setAthleteToDelete(null);
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
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Specialties</label>
                  <button
                    type="button"
                    onClick={() => appendSpecialty({ specialty: '' })}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add Specialty
                  </button>
                </div>
                {specialtyFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mb-2">
                    <input
                      {...register(`specialties.${index}.specialty`)}
                      placeholder="Enter specialty (e.g., Freestyle)"
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

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Records</label>
                  <button
                    type="button"
                    onClick={() => appendRecord({ record: '', date: '' })}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add Record
                  </button>
                </div>
                {recordFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border rounded-md">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Record</label>
                      <input
                        {...register(`records.${index}.record`)}
                        placeholder="e.g., National Record - 50m Freestyle - 42.48s"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Date</label>
                      <input
                        type="date"
                        {...register(`records.${index}.date`)}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeRecord(index)}
                        className="text-red-600 hover:text-red-700 md:col-span-2 text-center"
                      >
                        Remove Record
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Personal Bests</label>
                  <button
                    type="button"
                    onClick={() => appendPersonalBest({ value: '' })}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add Personal Best
                  </button>
                </div>
                {personalBestFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mb-2">
                    <input
                      {...register(`personal_bests.${index}.value`)}
                      placeholder="Enter personal best (e.g., 50m Freestyle - 23.45s)"
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removePersonalBest(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">International Appearances</label>
                  <button
                    type="button"
                    onClick={() => appendCap({ competition_name: '', year: new Date().getFullYear(), location: '' })}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add Appearance
                  </button>
                </div>
                {capFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded-md">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Competition</label>
                      <input
                        {...register(`caps.${index}.competition_name`)}
                        placeholder="e.g., Olympic Games"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Year</label>
                      <input
                        type="number"
                        {...register(`caps.${index}.year`)}
                        min={1900}
                        max={2100}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Location</label>
                      <input
                        {...register(`caps.${index}.location`)}
                        placeholder="e.g., Paris, France"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeCap(index)}
                        className="text-red-600 hover:text-red-700 md:col-span-3 text-center"
                      >
                        Remove Appearance
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
                    src={athlete.image || "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                    alt={athlete.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-semibold">{athlete.name}</h3>
                    {athlete.nickname && (
                      <p className="text-sm opacity-90">"{athlete.nickname}"</p>
                    )}
                    <p className="text-gray-200 capitalize">{athlete.sport?.replace('-', ' ') || 'Athlete'}</p>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    {athlete.height_meters && (
                      <div>
                        <span className="text-gray-600">Height:</span>
                        <span className="ml-1 font-medium">{athlete.height_meters}m</span>
                      </div>
                    )}
                    {athlete.weight_kg && (
                      <div>
                        <span className="text-gray-600">Weight:</span>
                        <span className="ml-1 font-medium">{athlete.weight_kg}kg</span>
                      </div>
                    )}
                  </div>

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

                  {athlete.personal_bests.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Personal Bests</h4>
                      <ul className="space-y-1">
                        {athlete.personal_bests.map((pb, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <Timer size={14} className="mr-2 text-primary-600" />
                            {pb.event}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {athlete.caps.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">International Appearances</h4>
                      <ul className="space-y-1">
                        {athlete.caps.map((cap, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <Medal size={14} className="mr-2 text-yellow-500" />
                            {cap.competition_name} ({cap.year}) - {cap.location}
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
                      onClick={() => handleDelete Click(athlete.id)}
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