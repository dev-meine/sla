import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase, cachedQuery } from '../../lib/supabase';
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
      const { data, error } = await cachedQuery(
        'featured-events',
        () => supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true })
          .limit(4) // Limiting to 4 for a cleaner list
      );
      
      if (error) throw error;
      
      const validatedEvents = data?.map(event => ({
        ...event,
        image: event.image || 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      })) || [];
      
      setEvents(validatedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return { day: '', month: '' };
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { day: '2-digit' }),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    };
  };

  if (isLoading) {
    return (
      <section className="bg-white py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Image & Intro */}
          <motion.div 
            className="lg:col-span-5 flex flex-col"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-block px-3 py-1 bg-white text-secondary-600 rounded-full font-sans tracking-widest text-xs uppercase font-bold mb-4 shadow-sm self-start"
            >
              Calendar
            </motion.span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-6 relative inline-block">
              Core Activities
              <span className="absolute -bottom-2 right-1/4 w-1/4 h-1 bg-secondary-400 rounded-full"></span>
            </h2>
            <p className="font-sans text-slate-600 text-lg font-medium leading-relaxed mb-10">
              We organize various activities throughout the year to promote swimming, diving, and water polo in Sierra Leone, fostering community and athletic excellence.
            </p>
            
            <motion.div 
                className="w-full aspect-[4/5] bg-slate-100 overflow-hidden mb-8 rounded-2xl shadow-sm border border-slate-100 relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <img 
                  src={events[0]?.image || "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                  alt="Featured Activity"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2s] ease-out"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
                  }}
                />
              </motion.div>
            
            <div className="hidden lg:block mt-8">
              <Link 
                to="/activities" 
                className="group inline-flex items-center px-8 py-4 bg-white text-primary-700 font-sans font-bold shadow-md hover:shadow-lg rounded-full transition-all uppercase tracking-wider text-sm ring-1 ring-slate-200"
              >
                View Full Calendar
                <motion.span 
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ArrowRight size={18} className="ml-3 text-primary-500" />
                </motion.span>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: List of Activities */}
          <motion.div 
            className="lg:col-span-7 flex flex-col pt-4 lg:pt-24 relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {events.map((event, i) => {
              const date = formatDate(event.date);
              return (
                <motion.article 
                  key={event.id} 
                  className="group relative bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-100 hover:shadow-[0_20px_50px_rgba(37,99,235,0.08)] transition-all duration-300 transform"
                  whileHover={{ y: -5, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                    
                    {/* Date Box */}
                    <div className="flex-shrink-0 w-24 h-24 flex flex-col justify-center items-center rounded-2xl bg-primary-50 text-primary-600 border-2 border-primary-100 group-hover:bg-primary-600 group-hover:text-white group-hover:border-transparent transition-all duration-300">
                      <span className="font-sans font-bold tracking-widest text-xs uppercase mb-1 drop-shadow-sm">
                        {date.month}
                      </span>
                      <span className="font-heading text-4xl font-bold leading-none drop-shadow-sm">
                        {date.day}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-grow md:pr-8">
                      <span className="inline-block px-3 py-1 bg-white border border-slate-200 shadow-sm text-secondary-600 text-[10px] tracking-widest uppercase font-bold mb-3 rounded-full">
                        {event.category?.replace('-', ' ') || 'General'}
                      </span>
                      <h3 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="font-sans text-slate-500 font-medium leading-relaxed mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Arrow (Desktop) */}
                    <div className="hidden md:flex flex-shrink-0 items-center justify-center w-12 h-12 rounded-full border-2 border-slate-100 group-hover:border-transparent group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-sm self-center">
                      <motion.div
                        initial={{ x: 0, y: 0 }}
                        whileHover={{ x: 3, y: -3 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ArrowUpRight size={20} />
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Clickable Overlay */}
                  <Link to="/activities" className="absolute inset-0 z-10">
                    <span className="sr-only">View Activity: {event.title}</span>
                  </Link>
                </motion.article>
              );
            })}
            
            <div className="mt-8 lg:hidden">
              <Link 
                to="/activities" 
                className="w-full flex justify-center items-center bg-white text-primary-700 font-sans font-bold shadow-md rounded-full transition-all uppercase tracking-wider text-sm ring-1 ring-slate-200 py-4 active:scale-95"
              >
                View Full Calendar
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ActivitiesHighlight;