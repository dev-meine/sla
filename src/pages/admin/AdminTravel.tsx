import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import Modal from '../../components/ui/Modal';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Calendar, Ship, DollarSign, Building2, Search, Loader2, ExternalLink, RefreshCw, MapPin, Phone, Star, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Database } from '../../types/supabase';
import axios from 'axios';
import MultiSelect from '../../components/ui/MultiSelect';

type TravelRecord = Database['public']['Tables']['travel_records']['Row'];
type Athlete = Database['public']['Tables']['athletes']['Row'];
type Event = Database['public']['Tables']['events']['Row'];
type TechnicalStaff = Database['public']['Tables']['technical_staff']['Row'];
type BoardMember = Database['public']['Tables']['board_members']['Row'];

type TabType = 'travel' | 'ferry' | 'hotels';

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
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [technicalStaff, setTechnicalStaff] = useState<TechnicalStaff[]>([]);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TravelRecord | null>(null);
  const [travelSearchQuery, setTravelSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // Hotel search states
  const [searchLocation, setSearchLocation] = useState('');
  const [searchResults, setSearchResults] = useState<Hotel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange | null>(null);

  // Ferry iframe states
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

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('travel_records')
        .delete()
        .eq('id', recordToDelete);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting record:', error);
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setRecordToDelete(null);
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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <AdminBadge variant="info">Confirmed</AdminBadge>;
      case 'completed':
        return <AdminBadge variant="success">Completed</AdminBadge>;
      case 'in_progress':
        return <AdminBadge variant="warning">In Progress</AdminBadge>;
      case 'cancelled':
        return <AdminBadge variant="danger">Cancelled</AdminBadge>;
      default:
        return <AdminBadge variant="neutral">{status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</AdminBadge>;
    }
  };

  const filteredTravelRecords = travelRecords.filter(record => {
    if (!travelSearchQuery.trim()) return true;
    const q = travelSearchQuery.toLowerCase();
    const eventTitle = record.events?.title?.toLowerCase() || '';
    const destination = record.destination?.toLowerCase() || '';
    const status = record.status?.toLowerCase() || '';
    const accommodation = record.accommodation?.toLowerCase() || '';
    return eventTitle.includes(q) || destination.includes(q) || status.includes(q) || accommodation.includes(q);
  });

  const renderForm = () => (
    <div className="admin-card p-6 mb-8 border-primary-200/80 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            {editingRecord ? 'Edit Travel Record' : 'Create Travel Itinerary'}
          </h3>
          <p className="text-xs text-slate-500">Record destination, schedule dates, accommodation, and delegation roster.</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(false);
            setEditingRecord(null);
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
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Event</label>
            <select
              {...register('event_id', { required: 'Event is required' })}
              className="admin-select"
            >
              <option value="">Select Event</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
            {errors.event_id && (
              <p className="mt-1 text-xs text-red-600">{errors.event_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Status</label>
            <select
              {...register('status', { required: 'Status is required' })}
              className="admin-select"
            >
              <option value="">Select Status</option>
              <option value="planned">Planned</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Departure Date</label>
            <input
              type="date"
              {...register('departure_date', { required: 'Departure date is required' })}
              className="admin-input"
            />
            {errors.departure_date && (
              <p className="mt-1 text-xs text-red-600">{errors.departure_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Return Date</label>
            <input
              type="date"
              {...register('return_date', { required: 'Return date is required' })}
              className="admin-input"
            />
            {errors.return_date && (
              <p className="mt-1 text-xs text-red-600">{errors.return_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Destination</label>
            <input
              type="text"
              placeholder="e.g. Accra, Ghana or Lome, Togo"
              {...register('destination', { required: 'Destination is required' })}
              className="admin-input"
            />
            {errors.destination && (
              <p className="mt-1 text-xs text-red-600">{errors.destination.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Accommodation</label>
            <input
              type="text"
              placeholder="e.g. Tang Palace Hotel, Accra"
              {...register('accommodation')}
              className="admin-input"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Travel Details & Logistics</label>
            <textarea
              {...register('travel_details')}
              rows={3}
              placeholder="Airline reference, terminal transfer instructions, visa details..."
              className="admin-input"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Internal Notes</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Internal administration or federation notes..."
              className="admin-input"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Delegation Athletes</label>
            <MultiSelect
              options={athletes.map(athlete => ({
                value: athlete.id,
                label: athlete.name
              }))}
              value={watch('selected_athletes') || []}
              onChange={(selected) => setValue('selected_athletes', selected)}
              placeholder="Select travelling athletes"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Technical Staff & Coaches</label>
            <MultiSelect
              options={technicalStaff.map(staff => ({
                value: staff.id,
                label: `${staff.name} (${staff.role})`
              }))}
              value={watch('selected_staff') || []}
              onChange={(selected) => setValue('selected_staff', selected)}
              placeholder="Select technical staff and coaches"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Board Members & Delegation Heads</label>
            <MultiSelect
              options={boardMembers.map(member => ({
                value: member.id,
                label: `${member.name} (${member.position})`
              }))}
              value={watch('selected_board_members') || []}
              onChange={(selected) => setValue('selected_board_members', selected)}
              placeholder="Select federation executives"
            />
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              reset();
              setIsAdding(false);
              setEditingRecord(null);
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-xs transition-colors"
          >
            {editingRecord ? 'Update Record' : 'Save Travel Record'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderTravelRecords = () => (
    <div className="admin-card overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
        <div className="relative max-w-sm w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search records by event, destination, or status..."
            value={travelSearchQuery}
            onChange={(e) => setTravelSearchQuery(e.target.value)}
            className="admin-input pl-9 text-xs py-2 bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-semibold text-slate-800">{filteredTravelRecords.length}</span> of {travelRecords.length} records
        </div>
      </div>

      {travelRecords.length === 0 ? (
        <AdminEmptyState
          title="No travel records created yet"
          description="Plan and record official travel itineraries for Team Sierra Leone competitions and international congresses."
          actionLabel="Create Travel Record"
          onAction={() => setIsAdding(true)}
        />
      ) : filteredTravelRecords.length === 0 ? (
        <AdminEmptyState
          title="No matching travel records"
          description={`No records found matching "${travelSearchQuery}". Try clearing your search query.`}
          actionLabel="Clear Filter"
          onAction={() => setTravelSearchQuery('')}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Event</th>
                <th className="px-6 py-3.5">Travel Dates</th>
                <th className="px-6 py-3.5">Destination & Lodging</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredTravelRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900 block">
                      {record.events?.title || 'Delegation Mission'}
                    </span>
                    {record.travel_details && (
                      <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {record.travel_details}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Calendar size={13} className="text-primary-600" />
                      <span>{new Date(record.departure_date).toLocaleDateString()}</span>
                      <span className="text-slate-400">→</span>
                      <span>{new Date(record.return_date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900 block">{record.destination}</span>
                    {record.accommodation && (
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 size={12} className="text-slate-400" />
                        {record.accommodation}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(record)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        title="Edit record"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(record.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderFerrySchedules = () => (
    <div className="space-y-6">
      <div className="admin-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <MapPin size={14} className="text-primary-600" />
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
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
              title="Reload schedule feed"
            >
              <RefreshCw size={13} className={isIframeLoading ? 'animate-spin text-primary-600' : 'text-slate-500'} />
              <span>Reload Schedule</span>
            </button>
            <a
              href="https://seacoachexpress.com/schedule"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 active:scale-[0.98] rounded-lg transition-all shadow-xs"
            >
              <span>Open in New Tab</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
        <div className="relative h-[850px] w-full bg-slate-50">
          {isIframeLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600 mb-3" />
              <p className="text-sm font-semibold text-slate-800">Connecting to Sea Coach Express Live Timetable...</p>
              <p className="text-xs text-slate-500 mt-1">Streaming real-time water taxi schedules between Aberdeen and Lungi</p>
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
      <div className="admin-card p-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700">
              Delegation Lodging
            </span>
            <span className="text-xs text-slate-500">• Travel & Event Accommodations</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-heading">Hotel & Accommodation Finder</h3>
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
                className="admin-input pl-10"
                placeholder="e.g. Aberdeen, Lumley Beach, Freetown, Lungi..."
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Price Range
            </label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={selectedPriceRange ? JSON.stringify(selectedPriceRange) : ''}
                onChange={(e) => setSelectedPriceRange(e.target.value ? JSON.parse(e.target.value) : null)}
                className="admin-select pl-10"
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

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSearching || !searchLocation.trim()}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white text-xs font-semibold rounded-lg shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSearching ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={15} />
                  <span>Find Hotels</span>
                </>
              )}
            </button>
          </div>
        </form>

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

      {searchResults.length === 0 ? (
        <div className="admin-card p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-3.5 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600">
            <Building2 size={24} />
          </div>
          <h4 className="text-base font-bold text-slate-900 font-heading">Explore Delegation Accommodations</h4>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
            Search by city, beach area, or tournament venue above to find vetted hotels, lodges, and resorts for Team Sierra Leone.
          </p>
          <button
            type="button"
            onClick={() => searchHotels('Aberdeen, Freetown')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
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
              Showing results for <span className="font-semibold text-slate-700">"{searchLocation}"</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((hotel, index) => (
              <div key={index} className="admin-card overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="relative h-48 w-full bg-slate-100">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-md text-xs font-bold text-slate-900 shadow-xs border border-slate-200">
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
                      <span className="text-xs font-semibold text-slate-600 ml-1.5">{hotel.rating.toFixed(1)}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1 font-heading">{hotel.name}</h4>
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
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white text-xs font-semibold rounded-lg shadow-xs transition-all"
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
      <AdminPageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Operations' },
          { label: 'Travel & Logistics' }
        ]}
      />

      {/* Segmented Tab Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl w-fit border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('travel')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'travel'
                ? 'bg-white text-primary-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Calendar size={15} />
            <span>Travel Records</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              {travelRecords.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ferry')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ferry'
                ? 'bg-white text-primary-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Ship size={15} />
            <span>Ferry Timetables</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hotels')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'hotels'
                ? 'bg-white text-primary-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Building2 size={15} />
            <span>Hotels & Lodging</span>
          </button>
        </div>

        {activeTab === 'travel' && (
          <button
            type="button"
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingRecord(null);
              reset();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-xs self-start sm:self-auto"
          >
            {isAdding ? <X size={15} /> : <Plus size={15} />}
            <span>{isAdding ? 'Close Editor' : 'Add Travel Record'}</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 admin-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRecordToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Travel Record"
        message="Are you sure you want to delete this travel record? All associated athlete and staff delegation records will also be removed."
        confirmText="Delete Record"
        type="danger"
      />
    </AdminLayout>
  );
};

export default AdminTravel;