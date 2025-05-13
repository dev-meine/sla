import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Edit2, Trash2, Calendar, Plane, Ship, Clock, DollarSign, Building2, Search, Loader2, SlidersHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Database } from '../../types/supabase';
import axios from 'axios';

type TravelRecord = Database['public']['Tables']['travel_records']['Row'];
type Flight = Database['public']['Tables']['flights']['Row'];
type FerrySchedule = Database['public']['Tables']['ferry_schedules']['Row'];
type Athlete = Database['public']['Tables']['athletes']['Row'];
type Event = Database['public']['Tables']['events']['Row'];

type TabType = 'travel' | 'flights' | 'ferry' | 'hotels';

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
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchResults, setSearchResults] = useState<Hotel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

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
        { data: eventsData }
      ] = await Promise.all([
        supabase
          .from('travel_records')
          .select('*, athletes(name), events(title)')
          .order('departure_date', { ascending: false }),
        supabase
          .from('flights')
          .select('*, travel_records(id, athletes(name))')
          .order('departure_time', { ascending: false }),
        supabase
          .from('ferry_schedules')
          .select('*, travel_records(id, athletes(name))')
          .order('departure_time', { ascending: false }),
        supabase
          .from('athletes')
          .select('id, name')
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
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchHotels = async () => {
    if (!searchLocation.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      const response = await axios.get(`https://booking-com.p.rapidapi.com/v1/hotels/search`, {
        params: {
          checkin_date: new Date().toISOString().split('T')[0],
          dest_type: 'city',
          units: 'metric',
          checkout_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          adults_number: '2',
          order_by: 'popularity',
          dest_id: '-1',
          filter_by_currency: 'USD',
          locale: 'en-us',
          room_number: '1',
          children_number: '0',
          page_number: '0',
          include_adjacency: 'true',
          children_ages: '',
          categories_filter_ids: '',
          dest_name: searchLocation
        },
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
        }
      });

      const hotels = response.data.result.map((hotel: any) => ({
        name: hotel.hotel_name,
        address: hotel.address,
        rating: hotel.review_score || 0,
        price: hotel.min_total_price,
        image: hotel.max_photo_url,
        url: hotel.url
      }));

      // Filter by price range if selected
      const filteredHotels = selectedPriceRange
        ? hotels.filter(hotel => {
            const price = parseFloat(hotel.price);
            return price >= selectedPriceRange.min && price <= selectedPriceRange.max;
          })
        : hotels;

      setSearchResults(filteredHotels);
    } catch (error) {
      console.error('Error searching hotels:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      
      let table = '';
      switch (activeTab) {
        case 'travel':
          table = 'travel_records';
          break;
        case 'flights':
          table = 'flights';
          break;
        case 'ferry':
          table = 'ferry_schedules';
          break;
      }
      
      if (editingRecord) {
        const { error } = await supabase
          .from(table)
          .update(data)
          .eq('id', editingRecord.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table)
          .insert([data]);
          
        if (error) throw error;
      }

      reset();
      setIsAdding(false);
      setEditingRecord(null);
      fetchData();
    } catch (error) {
      console.error('Error saving record:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setIsAdding(true);
    Object.keys(record).forEach((key) => {
      if (key !== 'athletes' && key !== 'events' && key !== 'travel_records') {
        setValue(key, record[key]);
      }
    });
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      
      let table = '';
      switch (activeTab) {
        case 'travel':
          table = 'travel_records';
          break;
        case 'flights':
          table = 'flights';
          break;
        case 'ferry':
          table = 'ferry_schedules';
          break;
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting record:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'flights':
        return (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Travel Record</label>
              <select
                {...register('travel_record_id', { required: 'Travel record is required' })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Travel Record</option>
                {travelRecords.map((record) => (
                  <option key={record.id} value={record.id}>
                    {(record.athletes as any)?.name} - {record.destination}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Airline</label>
              <input
                type="text"
                {...register('airline', { required: 'Airline is required' })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
              <input
                type="text"
                {...register('flight_number', { required: 'Flight number is required' })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure Airport</label>
              <input
                type="text"
                {...register('departure_airport', { required: 'Departure airport is required' })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Airport</label>
              <input
                type="text"
                {...register('arrival_airport', { required: 'Arrival airport is required' })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
              <input
                type="datetime-local"
                {...register('departure_time', { required: 'Departure time is required' })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
              <input
                type="datetime-local"
                {...register('arrival_time', { required: 'Arrival time is required' })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                {...register('price')}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booking Status</label>
              <select
                {...register('booking_status')}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingRecord(null);
                  reset();
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingRecord ? 'Update' : 'Save'} Flight
              </button>
            </div>
          </form>
        );

      default:
        return (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Athlete</label>
              <select
                {...register('athlete_id', { required: 'Athlete is required' })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Athlete</option>
                {athletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
              <select
                {...register('event_id', { required: 'Event is required' })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} ({new Date(event.date || '').toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
              <input
                type="date"
                {...register('departure_date', { required: 'Departure date is required' })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
              <input
                type="date"
                {...register('return_date', { required: 'Return date is required' })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <input
                type="text"
                {...register('destination', { required: 'Destination is required' })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                {...register('status', { required: 'Status is required' })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accommodation</label>
              <input
                type="text"
                {...register('accommodation')}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Hotel name, address, etc."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Travel Details</label>
              <textarea
                {...register('travel_details')}
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Additional travel information..."
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Additional notes..."
              ></textarea>
            </div>

            <div className="md:col-span-2 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingRecord(null);
                  reset();
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingRecord ? 'Update' : 'Save'} Travel Record
              </button>
            </div>
          </form>
        );
    }
  };

  const renderTable = () => {
    switch (activeTab) {
      case 'flights':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Athlete
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flight Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Times
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flights.map((flight) => (
                <tr key={flight.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {(flight.travel_records as any)?.athletes?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{flight.airline} {flight.flight_number}</div>
                      <div className="text-gray-500">
                        {flight.departure_airport} → {flight.arrival_airport}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {new Date(flight.departure_time).toLocaleString()}
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock size={14} className="mr-1" />
                        {new Date(flight.arrival_time).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <DollarSign size={14} className="mr-1" />
                      {flight.price?.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      flight.booking_status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : flight.booking_status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {flight.booking_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(flight)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(flight.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Athlete
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {travelRecords.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {(record.athletes as any)?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(record.events as any)?.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(record.departure_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center mt-1">
                        <Calendar size={14} className="mr-1" />
                        {new Date(record.return_date).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.destination}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : record.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : record.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(record)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Travel Management</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setActiveTab('travel');
                  setIsAdding(false);
                  setEditingRecord(null);
                  reset();
                }}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  activeTab === 'travel'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar size={20} className="mr-2" />
                Travel Records
              </button>
              <button
                onClick={() => {
                  setActiveTab('flights');
                  setIsAdding(false);
                  setEditingRecord(null);
                  reset();
                }}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  activeTab === 'flights'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Plane size={20} className="mr-2" />
                Flights
              </button>
              <button
                onClick={() => {
                  setActiveTab('ferry');
                  setIsAdding(false);
                  setEditingRecord(null);
                  reset();
                }}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  activeTab === 'ferry'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Ship size={20} className="mr-2" />
                Ferry Schedule
              </button>
              <button
                onClick={() => {
                  setActiveTab('hotels');
                  setIsAdding(false);
                  setEditingRecord(null);
                  reset();
                }}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  activeTab === 'hotels'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Building2 size={20} className="mr-2" />
                Hotels
              </button>
            </div>
          </div>
          {activeTab !== 'ferry' && activeTab !== 'hotels' && (
            <button
              onClick={() => {
                setIsAdding(!isAdding);
                setEditingRecord(null);
                reset();
              }}
              className="btn btn-primary"
            >
              <PlusCircle size={20} className="mr-2" />
              Add {activeTab === 'flights' ? 'Flight' : 'Travel Record'}
            </button>
          )}
        </div>

        {activeTab === 'hotels' ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Search Hotels</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder="Enter destination city..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <button
                    onClick={searchHotels}
                    disabled={isSearching}
                    className="btn btn-primary"
                  >
                    {isSearching ? (
                      <Loader2 size={20} className="mr-2 animate-spin" />
                    ) : (
                      <Search size={20} className="mr-2" />
                    )}
                    Search
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SlidersHorizontal size={16} className="inline mr-2" />
                    Price Range
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedPriceRange(null);
                        if (searchResults.length > 0) searchHotels();
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedPriceRange === null
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Prices
                    </button>
                    {priceRanges.map((range, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedPriceRange(range);
                          if (searchResults.length > 0) searchHotels();
                
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedPriceRange === range
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
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
                    <h4 className="text-lg font-semibold mb-2">{hotel.name}</h4>
                    <p className="text-gray-600 text-sm mb-2">{hotel.address}</p>
                
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 text-gray-600">{hotel.rating}</span>
                      </div>
                      <span className="text-primary-600 font-semibold">${hotel.price}/night</span>
                    </div>
                    <a
                      href={hotel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary w-full text-center"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {searchResults.length === 0 && !isSearching && searchLocation && (
              <div className="text-center py-12 text-gray-500">
                No hotels found. Try a different location or price range.
              </div>
            )}
          </div>
        ) : activeTab === 'ferry' ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Sea Coach Express Schedule</h3>
            <div className="relative w-full" style={{height: "800px"}}>
              <iframe
                src="https://seacoachexpress.com/schedule"
                className="absolute inset-0 w-full h-full border-0 rounded-lg"
                title="Sea Coach Express Schedule"
              ></iframe>
            </div>
          </div>
        ) : (
          <>
            {isAdding && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold mb-4">
                  {editingRecord
                    ? `Edit ${activeTab === 'flights' ? 'Flight' : 'Travel Record'}`
                    : `Add New ${activeTab === 'flights' ? 'Flight' : 'Travel Record'}`}
                </h3>
                {renderForm()}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {renderTable()}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTravel;