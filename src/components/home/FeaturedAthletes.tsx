import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase, cachedQuery } from '../../lib/supabase';
import { Database } from '../../types/supabase';

type Athlete = Database['public']['Tables']['athletes']['Row'] & {
  specialties: Database['public']['Tables']['specialties']['Row'][];
  achievements: Database['public']['Tables']['achievements']['Row'][];
};

const FeaturedAthletes: React.FC = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const { data: athletesData, error } = await cachedQuery(
        'featured-athletes',
        () => supabase
          .from('athletes')
          .select(`
            *,
            specialties (
              id,
              specialty
            ),
            achievements (
              id,
              achievement
            )
          `)
          .order('name')
          .limit(3)
      );

      if (error) throw error;
      setAthletes(athletesData || []);
    } catch (error) {
      console.error('Error fetching athletes:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  if (isLoading) {
    return (
      <section className="bg-white py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-sans tracking-widest text-xs uppercase font-bold mb-4 shadow-sm"
            >
              Elite Roster
            </motion.span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-6 relative inline-block">
              Our Athletes
              <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-secondary-400 rounded-full"></span>
            </h2>
            <p className="font-sans text-slate-600 text-lg font-medium leading-relaxed mt-4">
              Meet our talented athletes representing Sierra Leone in swimming, diving, and water polo competitions around the world.
            </p>
          </div>
          <Link 
            to="/athletes" 
            className="group mt-8 md:mt-0 inline-flex items-center px-6 py-3 bg-white text-primary-700 font-sans font-bold shadow-sm hover:shadow-md rounded-full transition-all uppercase tracking-wider text-sm ring-1 ring-slate-200"
          >
            Directory
            <motion.span 
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <ArrowRight size={16} className="ml-2 text-primary-500" />
            </motion.span>
          </Link>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {athletes.map((athlete) => (
            <motion.article key={athlete.id} className="group cursor-pointer" variants={item}>
              <Link to={`/athletes/${athlete.id}`} className="block">
                <motion.div 
                  className="w-full aspect-[3/4] rounded-2xl overflow-hidden mb-6 bg-slate-200 relative shadow-md group-hover:shadow-[0_20px_50px_rgba(37,99,235,0.2)] transition-shadow duration-500 ring-1 ring-white/50"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <img 
                    src={athlete.image || "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                    alt={athlete.name}
                    className="w-full h-full object-cover object-top filter saturate-110 contrast-110 transition-transform duration-[1.5s] ease-out transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-primary-900/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </motion.div>
                
                <div className="flex justify-between items-start mb-4 px-2">
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                      {athlete.name}
                    </h3>
                    <p className="inline-block px-2 py-1 bg-white shadow-sm ring-1 ring-slate-200 rounded text-primary-600 font-bold tracking-widest text-[10px] uppercase mt-2">
                      {athlete.sport?.replace('-', ' ') || 'Athlete'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/60 grid grid-cols-2 gap-4 px-2">
                  {athlete.specialties.length > 0 && (
                    <div>
                      <span className="block text-slate-400 text-[10px] uppercase tracking-widest mb-2 font-bold flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary-400 mr-1.5"></span>
                        Specialties
                      </span>
                      <ul className="text-sm font-sans text-slate-700 font-medium space-y-1">
                        {athlete.specialties.slice(0, 2).map((specialty, index) => (
                          <li key={index} className="truncate group-hover:text-slate-900 transition-colors">{specialty.specialty}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {athlete.achievements.length > 0 && (
                    <div>
                      <span className="block text-slate-400 text-[10px] uppercase tracking-widest mb-2 font-bold flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mr-1.5"></span>
                        Key Wins
                      </span>
                      <ul className="text-sm font-sans text-slate-700 font-medium space-y-1">
                        {athlete.achievements.slice(0, 2).map((achievement, index) => (
                          <li key={index} className="truncate group-hover:text-slate-900 transition-colors">{achievement.achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>

        {athletes.length === 0 && (
          <div className="text-center py-20 border-t border-slate-200 mt-12">
            <p className="font-sans text-slate-500 font-medium">No elite athletes featured at this moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedAthletes;