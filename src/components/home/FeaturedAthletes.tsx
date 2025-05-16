import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Medal, ArrowRight } from 'lucide-react';
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <section className="section">
        <div className="container-custom">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 className="mb-4">Our Athletes</h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Meet our talented athletes representing Sierra Leone in swimming, diving, and water polo competitions around the world.
            </p>
          </div>
          <Link to="/athletes" className="mt-4 md:mt-0 inline-flex items-center font-medium text-primary-600 hover:text-primary-700">
            View All Athletes
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {athletes.map((athlete) => (
            <motion.div key={athlete.id} className="card group" variants={item}>
              <div className="relative h-[400px] overflow-hidden">
                <img 
                  src={athlete.image || "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                  alt={athlete.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-semibold mb-1 text-white">{athlete.name}</h3>
                  <p className="text-gray-200 capitalize">{athlete.sport?.replace('-', ' ') || 'Athlete'}</p>
                </div>
              </div>
              <div className="p-6">
                {athlete.specialties.length > 0 && (
                  <div className="flex items-start mb-4">
                    <Medal size={18} className="text-yellow-500 mr-2 mt-1" />
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Specialties</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {athlete.specialties.slice(0, 2).map((specialty, index) => (
                          <li key={index}>• {specialty.specialty}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {athlete.achievements.length > 0 && (
                  <div className="flex items-start mb-4">
                    <Medal size={18} className="text-yellow-500 mr-2 mt-1" />
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Key Achievements</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {athlete.achievements.slice(0, 2).map((achievement, index) => (
                          <li key={index}>• {achievement.achievement}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <Link 
                  to={`/athletes/${athlete.id}`} 
                  className="inline-flex items-center font-medium text-primary-600 hover:text-primary-700"
                >
                  View Profile
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {athletes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No athletes available.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedAthletes;