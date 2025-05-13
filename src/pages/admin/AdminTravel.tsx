import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Edit2, Trash2, Calendar, Plane, Ship, Clock, DollarSign, Building2, Search, Loader2, SlidersHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Database } from '../../types/supabase';
import axios from 'axios';
import MultiSelect from '../../components/ui/MultiSelect';

type TravelRecord = Database['public']['Tables']['travel_records']['Row'];
type Flight = Database['public']['Tables']['flights']['Row'];
type FerrySchedule = Database['public']['Tables']['ferry_schedules']['Row'];
type Athlete = Database['public']['Tables']['athletes']['Row'];
type Event = Database['public']['Tables']['events']['Row'];
type TechnicalStaff = Database['public']['Tables']['technical_staff']['Row'];
type BoardMember = Database['public']['Tables']['board_members']['Row'];

type TabType = 'travel' | 'flights' | 'ferry' | 'hotels';

type TravelFormData = {
  event_id: string;
  departure_date: string;
  return_date: string;
  destination: string;
  accommodation: string;
  travel_details: string;
  status: string;
  notes: string;
  selected_athletes: string[];
  selected_staff: string[];
  selected_board_members: string[];
};

interface Hotel {
  name: string;
  address: string;
  rating: number;
  price: string;
  image: string;
  url: string;
}

interface PriceRange {
  min: number;
  max: number;
  label: string;
}

const priceRanges: PriceRange[] = [
  { min: 0, max: 100, label: 'Under $100' },
  { min: 100, max: 200, label: '$100 - $200' },
  { min: 200, max: 300, label: '$200 - $300' },
  { min: 300, max: 500, label: '$300 - $500' },
  { min: 500, max: Infinity, label: '$500+' }
];

const AdminTravel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('travel');
  const [travelRecords, setTravelRecords] = useState<TravelRecord[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [ferrySchedules, setFerrySchedules] = useState<FerrySchedule[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [technicalStaff, setTechnicalStaff] = useState<TechnicalStaff[]>([]);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchResults, setSearchResults] = useState<Hotel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TravelFormData>();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [
        { data: travelData },
        { data: flightsData },
        { data: ferryData },
        { data: athletesData },
        { data: staffData },
        { data: boardData },
        { data: eventsData }
      ] = await Promise.all([
        supabase
          .from('travel_records')
          .select('*, events(title)')
          .order('departure_date', { ascending: false }),
        supabase
          .from('flights')
          .select('*, travel_records(id)')
          .order('departure_time', { ascending: false }),
        supabase
          .from('ferry_schedules')
          .select('*, travel_records(id)')
          .order('departure_time', { ascending: false }),
        supabase
          .from('athletes')
          .select('id, name')
          .order('name'),
        supabase
          .from('technical_staff')
          .select('id, name, role')
          .order('name'),
        supabase
          .from('board_members')
          .select('id, name, position')
          .order('name'),
        supabase
          .from('events')
          .select('id, title, date')
          .order('date')
      ]);

      setTravelRecords(travelData || []);
      setFlights(flightsData || []);
      setFerrySchedules(ferryData || []);
      setAthletes(athletesData || []);
      setTechnicalStaff(staffData || []);
      setBoardMembers(boardData || []);
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: TravelFormData) => {
    try {
      setIsLoading(true);
      
      if (editingRecord) {
        // Update travel record
        const { error: recordError } = await supabase
          .from('travel_records')
          .update({
            event_id: data.event_id,
            departure_date: data.departure_date,
            return_date: data.return_date,
            destination: data.destination,
            accommodation: data.accommodation,
            travel_details: data.travel_details,
            status: data.status,
            notes: data.notes
          })
          .eq('id', editingRecord.id);
          
        if (recordError) throw recordError;

        // Delete existing relationships
        await Promise.all([
          supabase.from('travel_record_athletes').delete().eq('travel_record_id', editingRecord.id),
          supabase.from('travel_record_staff').delete().eq('travel_record_id', editingRecord.id),
          supabase.from('travel_record_board_members').delete().eq('travel_record_id', editingRecord.id)
        ]);

        // Insert new relationships
        await Promise.all([
          supabase.from('travel_record_athletes').insert(
            data.selected_athletes.map(athleteId => ({
              travel_record_id: editingRecord.id,
              athlete_id: athleteId
            }))
          ),
          supabase.from('travel_record_staff').insert(
            data.selected_staff.map(staffId => ({
              travel_record_id: editingRecord.id,
              staff_id: staffId
            }))
          ),
          supabase.from('travel_record_board_members').insert(
            data.selected_board_members.map(memberId => ({
              travel_record_id: editingRecord.id,
              board_member_id: memberId
            }))
          )
        ]);
      } else {
        // Insert new travel record
        const { data: newRecord, error: recordError } = await supabase
          .from('travel_records')
          .insert([{
            event_id: data.event_id,
            departure_date: data.departure_date,
            return_date: data.return_date,
            destination: data.destination,
            accommodation: data.accommodation,
            travel_details: data.travel_details,
            status: data.status,
            notes: data.notes
          }])
          .select()
          .single();
          
        if (recordError) throw recordError;

        // Insert relationships
        await Promise.all([
          supabase.from('travel_record_athletes').insert(
            data.selected_athletes.map(athleteId => ({
              travel_record_id: newRecord.id,
              athlete_id: athleteId
            }))
          ),
          supabase.from('travel_record_staff').insert(
            data.selected_staff.map(staffId => ({
              travel_record_id: newRecord.id,
              staff_id: staffId
            }))
          ),
          supabase.from('travel_record_board_members').insert(
            data.selected_board_members.map(memberId => ({
              travel_record_id: newRecord.id,
              board_member_id: memberId
            }))
          )
        ]);
      }

      reset();
      setIsAdding(false);
      setEditingRecord(null);
      fetchData();
    } catch (error) {
      console.error('Error saving travel record:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (record: TravelRecord) => {
    setEditingRecord(record);
    setIsAdding(true);
    setValue('event_id', record.event_id);
    setValue('departure_date', record.departure_date);
    setValue('return_date', record.return_date);
    setValue('destination', record.destination);
    setValue('accommodation', record.accommodation);
    setValue('travel_details', record.travel_details);
    setValue('status', record.status);
    setValue('notes', record.notes || '');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        setIsLoading(true);
        const { error } = await supabase
          .from('travel_records')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchData();
      } catch (error) {
        console.error('Error deleting record:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const searchHotels = async () => {
    if (!searchLocation) return;
    
    setIsSearching(true);
    try {
      const response = await axios.get('/api/search-hotels', {
        params: {
          location: searchLocation,
          priceMin: selectedPriceRange?.min,
          priceMax: selectedPriceRange?.max
        }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching hotels:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Event</label>
          <select
            {...register('event_id', { required: 'Event is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Event</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
          {errors.event_id && (
            <p className="mt-1 text-sm text-red-600">{errors.event_id.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Departure Date</label>
          <input
            type="date"
            {...register('departure_date', { required: 'Departure date is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.departure_date && (
            <p className="mt-1 text-sm text-red-600">{errors.departure_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Return Date</label>
          <input
            type="date"
            {...register('return_date', { required: 'Return date is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.return_date && (
            <p className="mt-1 text-sm text-red-600">{errors.return_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Destination</label>
          <input
            type="text"
            {...register('destination', { required: 'Destination is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.destination && (
            <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Accommodation</label>
          <input
            type="text"
            {...register('accommodation')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            {...register('status', { required: 'Status is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Status</option>
            <option value="planned">Planned</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Travel Details</label>
          <textarea
            {...register('travel_details')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            {...register('notes')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Athletes</label>
          <MultiSelect
            options={athletes.map(athlete => ({
              value: athlete.id,
              label: athlete.name
            }))}
            value={watch('selected_athletes') || []}
            onChange={(selected) => setValue('selected_athletes', selected)}
            placeholder="Select athletes"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Technical Staff</label>
          <MultiSelect
            options={technicalStaff.map(staff => ({
              value: staff.id,
              label: `${staff.name} (${staff.role})`
            }))}
            value={watch('selected_staff') || []}
            onChange={(selected) => setValue('selected_staff', selected)}
            placeholder="Select technical staff"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Board Members</label>
          <MultiSelect
            options={boardMembers.map(member => ({
              value: member.id,
              label: `${member.name} (${member.position})`
            }))}
            value={watch('selected_board_members') || []}
            onChange={(selected) => setValue('selected_board_members', selected)}
            placeholder="Select board members"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => {
            reset();
            setIsAdding(false);
            setEditingRecord(null);
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {editingRecord ? 'Update' : 'Create'} Travel Record
        </button>
      </div>
    </form>
  );

  const renderTravelRecords = () => (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {travelRecords.map((record) => (
            <tr key={record.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.events?.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(record.departure_date).toLocaleDateString()} - {new Date(record.return_date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.destination}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${record.status === 'completed' ? 'bg-green-100 text-green-800' :
                    record.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    record.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    record.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {record.status.replace('_', ' ').charAt(0).toUpperCase() + record.status.slice(1).replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  onClick={() => handleEdit(record)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderHotelSearch = () => (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter location"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price Range</label>
          <select
            value={selectedPriceRange ? JSON.stringify(selectedPriceRange) : ''}
            onChange={(e) => setSelectedPriceRange(e.target.value ? JSON.parse(e.target.value) : null)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Any price</option>
            {priceRanges.map((range, index) => (
              <option key={index} value={JSON.stringify(range)}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={searchHotels}
          disabled={isSearching}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSearching ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResults.map((hotel, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={hotel.image}
              alt={hotel.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{hotel.name}</h3>
              <p className="text-sm text-gray-600">{hotel.address}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center">
                  {[...Array(Math.floor(hotel.rating))].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <span className="text-lg font-bold">{hotel.price}</span>
              </div>
              <a
                href={hotel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View Details
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Travel Management</h1>
            {!isAdding && activeTab === 'travel' && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add Travel Record
              </button>
            )}
          </div>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('travel')}
                className={`${
                  activeTab === 'travel'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Travel Records
              </button>
              <button
                onClick={() => setActiveTab('flights')}
                className={`${
                  activeTab === 'flights'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Plane className="h-5 w-5 mr-2" />
                Flights
              </button>
              <button
                onClick={() => setActiveTab('ferry')}
                className={`${
                  activeTab === 'ferry'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Ship className="h-5 w-5 mr-2" />
                Ferry Schedules
              </button>
              <button
                onClick={() => setActiveTab('hotels')}
                className={`${
                  activeTab === 'hotels'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Building2 className="h-5 w-5 mr-2" />
                Hotels
              </button>
            </nav>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {isAdding && activeTab === 'travel' && renderForm()}
            {!isAdding && activeTab === 'travel' && renderTravelRecords()}
            {activeTab === 'hotels' && renderHotelSearch()}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTravel;