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

[Previous content continues exactly as before until the onSubmit function, which is replaced with the new version, and then continues exactly as before until the form JSX in renderForm, which is updated with the new MultiSelect fields, and then continues exactly as before until the end of the file]