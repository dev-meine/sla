import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type Event = Database['public']['Tables']['events']['Row'];

const ActivitiesPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(events.map(event => event.category).filter(Boolean))];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Filter events by category
  const filteredEvents = activeCategory === 'all' 
    ? events 
    : events.filter(event => event.category === activeCategory);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Our Activities"
          description="Explore our programs, competitions, development initiatives, and training camps."
          image="https://images.pexels.com/photos/1415810/pexels-photo-1415810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        />
        <section className="section">
          <div className="container-custom">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Our Activities"
        description="Explore our programs, competitions, development initiatives, and training camps."
        image="https://images.pexels.com/photos/1415810/pexels-photo-1415810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      />

      <section className="section">
        <div className="container-custom">
          {/* Category filters */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                  activeCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {category === 'all' ? 'All Activities' : `${category}s`}
              </button>
            ))}
          </div>

          {/* Events grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            key={activeCategory}
          >
            {filteredEvents.map((event) => (
              <motion.div key={event.id} className="card group" variants={item}>
                <div className="h-56 overflow-hidden">
                  <img 
                    src={event.image || "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar size={14} className="mr-1" />
                    <span>{formatDate(event.date)}</span>
                    {event.category && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{event.category}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-xl mb-3">{event.title}</h3>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  <a href="#" className="inline-flex items-center font-medium text-primary-600 hover:text-primary-700">
                    Learn More
                    <ArrowRight size={16} className="ml-1" />
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No activities found in this category.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6">Get Involved</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl mb-3">Athletes</h3>
                <p className="text-gray-600 mb-4">Join training programs and compete in local and international events</p>
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">Learn More →</a>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl mb-3">Coaches</h3>
                <p className="text-gray-600 mb-4">Get certified and help develop the next generation of athletes</p>
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">Learn More →</a>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl mb-3">Volunteers</h3>
                <p className="text-gray-600 mb-4">Support our events and programs through volunteering</p>
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">Learn More →</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ActivitiesPage;