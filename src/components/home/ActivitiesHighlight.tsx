import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';

type Event = Database['public']['Tables']['events']['Row'];

const ActivitiesHighlight: React.FC = () => {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
        .limit(6);
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group events by category
  const categorizedEvents = events.reduce((acc, event) => {
    if (!event.category) return acc;
    if (!acc[event.category]) {
      acc[event.category] = [];
    }
    acc[event.category].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const categories = Object.keys(categorizedEvents);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (isLoading) {
    return (
      <section className="section bg-gradient-to-b from-white to-gray-50">
        <div className="container-custom">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="mb-4">Our Activities</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We organize various activities throughout the year to promote swimming, diving, and water polo in Sierra Leone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <motion.div 
            className="rounded-lg overflow-hidden shadow-lg h-96"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <img 
              src="https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
              alt="Swimming Competition" 
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Activities tabs */}
          <div>
            <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
              {categories.map((category) => (
                <motion.div 
                  key={category}
                  className="bg-white shadow-md rounded-lg p-6 flex-1 min-w-[220px]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  viewport={{ once: true }}
                >
                  <h3 className="capitalize text-xl mb-4">{category.replace('-', ' ')}s</h3>
                  <ul className="space-y-4">
                    {categorizedEvents[category].map((event) => (
                      <li key={event.id} className="border-l-2 border-primary-600 pl-4">
                        <h4 className="font-medium text-primary-700">{event.title}</h4>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar size={14} className="mr-1" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              className="text-right"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Link to="/activities" className="btn btn-primary">
                Explore All Activities
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActivitiesHighlight;