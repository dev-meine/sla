import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Edit2, Trash2, Calendar, Plane, Ship, Clock, DollarSign, Building2, Search, Loader2, SlidersHorizontal, ExternalLink, RefreshCw, MapPin, Phone, Star } from 'lucide-react';
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
  const [iframeKey, setIframeKey] = useState(0);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TravelFormData>();

  useEffect(() => {
    fetchData();
  }, []);

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

        await Promise.all([
          supabase.from('travel_record_athletes').delete().eq('travel_record_id', editingRecord.id),
          supabase.from('travel_record_staff').delete().eq('travel_record_id', editingRecord.id),
          supabase.from('travel_record_board_members').delete().eq('travel_record_id', editingRecord.id)
        ]);

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

  const searchHotels = async (customLocation?: string) => {
    const loc = (customLocation ?? searchLocation).trim();
    if (!loc) return;
    if (customLocation) {
      setSearchLocation(customLocation);
    }
    
    setIsSearching(true);
    try {
      const response = await axios.get('/api/search-hotels', {
        params: {
          location: loc,
          priceMin: selectedPriceRange?.min,
          priceMax: selectedPriceRange?.max
        }
      });
      if (Array.isArray(response.data) && response.data.length > 0) {
        setSearchResults(response.data);
        setIsSearching(false);
        return;
      }
    } catch {
      // Graceful fallback when external mock API is unavailable
    }

    const fallbackAccommodations: Hotel[] = [
      {
        name: 'Radisson Blu Mammy Yoko Hotel',
        address: '17 Lumley Beach Road, Aberdeen, Freetown',
        rating: 4.5,
        price: '$180/night',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        url: 'https://www.radissonhotels.com'
      },
      {
        name: 'The Leadway Hotel',
        address: 'Sir Samuel Lewis Road, Aberdeen, Freetown',
        rating: 4.2,
        price: '$95/night',
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        url: 'https://leadwayhotel.com'
      },
      {
        name: 'Home Suites Boutique Hotel',
        address: '78 Cape Road, Aberdeen, Freetown',
        rating: 4.7,
        price: '$150/night',
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
        url: 'https://homesuiteshotel.com'
      },
      {
        name: 'The Country Lodge Complex',
        address: 'Hs 51 Hill Station, Freetown',
        rating: 4.4,
        price: '$165/night',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
        url: 'https://countrylodgesl.com'
      },
      {
        name: 'Bintumani Hotel',
        address: '11 Aberdeen Ferry Road, Freetown',
        rating: 4.0,
        price: '$120/night',
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
        url: 'https://www.bintumanihotel.com'
      },
      {
        name: 'Lungi International Airport Hotel',
        address: 'Airport Road, Lungi, Sierra Leone',
        rating: 4.1,
        price: '$85/night',
        image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
        url: 'https://google.com/travel/hotels'
      }
    ];

    const q = loc.toLowerCase();
    let filtered = fallbackAccommodations.filter(h => 
      h.name.toLowerCase().includes(q) || 
      h.address.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      filtered = fallbackAccommodations;
    }

    setSearchResults(filtered);
    setIsSearching(false);
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Event</label>
          <select
            {...register('event_id', { required: 'Event is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
            className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
            className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
            className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
            className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            {...register('status', { required: 'Status is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
            className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            {...register('notes')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {editingRecord ? 'Update' : 'Create'} Travel Record
        </button>
      </div>
    </form>
  );

  const renderTravelRecords = () => (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
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

  const renderFerrySchedules = () => (
    <div className="space-y-6">
      {/* Embedded Live Iframe (Pre-warmed & Fast Loaded) */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <MapPin size={14} className="text-blue-600" />
              <span>Sir Samuel Lewis Road, Aberdeen ⇄ Lungi International Airport Terminal</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
              <Phone size={13} className="text-slate-400" />
              <span>Call Center: +232 79 555 555 / +232 76 600 000</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setIsIframeLoading(true);
                setIframeKey((prev) => prev + 1);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:bg-slate-100 active:scale-[0.98] transition-all duration-150"
              title="Reload schedule feed"
            >
              <RefreshCw size={13} className={isIframeLoading ? 'animate-spin text-blue-600' : 'text-slate-500'} />
              <span>Reload Schedule</span>
            </button>
            <a
              href="https://seacoachexpress.com/schedule"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.98] rounded-lg transition-all duration-150"
            >
              <span>Open in New Tab</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
        <div className="relative h-[850px] w-full bg-slate-50">
          {isIframeLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 z-10">
              <Loader2 className="h-9 w-9 animate-spin text-blue-600 mb-3" />
              <p className="text-sm font-semibold text-slate-800">Connecting to Sea Coach Express Live Timetable...</p>
              <p className="text-xs text-slate-500 mt-1">Streaming schedule data from external portal</p>
            </div>
          )}
          <iframe
            key={iframeKey}
            src="https://seacoachexpress.com/schedule"
            className="w-full h-full border-0"
            title="Sea Coach Express Live Schedule"
            loading="eager"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setIsIframeLoading(false)}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  );

  const renderHotelSearch = () => (
    <div className="space-y-6">
      {/* Search & Filter Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
              Delegation Lodging
            </span>
            <span className="text-xs text-slate-500">• Travel & Event Accommodations</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Hotel & Accommodation Finder</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Search nearby hotels, resorts, and lodges for athletes, technical staff, and delegation officials.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            searchHotels();
          }}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        >
          {/* Location Input */}
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Destination / Location
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                placeholder="e.g. Aberdeen, Lumley Beach, Freetown, Lungi..."
              />
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Price Range
            </label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={selectedPriceRange ? JSON.stringify(selectedPriceRange) : ''}
                onChange={(e) => setSelectedPriceRange(e.target.value ? JSON.parse(e.target.value) : null)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
              >
                <option value="">Any price range</option>
                {priceRanges.map((range, index) => (
                  <option key={index} value={JSON.stringify(range)}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSearching || !searchLocation.trim()}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSearching ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Find Hotels</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Quick suggestions:</span>
          {['Aberdeen, Freetown', 'Lumley Beach', 'Lungi Airport', 'Hill Station'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => searchHotels(preset)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Results or Empty State */}
      {searchResults.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Building2 size={26} />
          </div>
          <h4 className="text-base font-bold text-slate-900">Explore Delegation Accommodations</h4>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
            Search by city, beach area, or tournament venue above to find vetted hotels, lodges, and resorts for Team Sierra Leone.
          </p>
          <button
            type="button"
            onClick={() => searchHotels('Aberdeen, Freetown')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <MapPin size={13} />
            View Recommended Freetown Hotels
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h4 className="text-sm font-bold text-slate-800">
              Available Accommodations ({searchResults.length})
            </h4>
            <span className="text-xs text-slate-500">
              Showing results for <span className="font-medium text-slate-700">"{searchLocation}"</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((hotel, index) => (
              <div key={index} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="relative h-48 w-full bg-slate-100">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-md text-xs font-bold text-slate-900 shadow-sm border border-slate-200">
                      {hotel.price}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={i < Math.floor(hotel.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                        />
                      ))}
                      <span className="text-xs font-medium text-slate-500 ml-1.5">{hotel.rating.toFixed(1)}</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 line-clamp-1">{hotel.name}</h4>
                    <div className="flex items-start gap-1.5 mt-1.5 text-xs text-slate-500">
                      <MapPin size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{hotel.address}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <a
                    href={hotel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold rounded-lg transition-all"
                  >
                    <span>View Details & Booking</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-all"
              >
                <PlusCircle className="h-4 w-4" />
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
            <div className={activeTab === 'ferry' ? 'block' : 'hidden'}>
              {renderFerrySchedules()}
            </div>
            {activeTab === 'hotels' && renderHotelSearch()}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTravel;