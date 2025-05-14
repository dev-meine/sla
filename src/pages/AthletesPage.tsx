import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Medal, Calendar, MapPin, Trophy, Timer } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type Athlete = Database['public']['Tables']['athletes']['Row'];

const AthletesPage: React.FC = () => {
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const { data, error } = await supabase
        .from('athletes')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setAthletes(data || []);
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

  // Group athletes by sport
  const athletesByType = athletes.reduce((acc, athlete) => {
    const sport = athlete.sport || 'other';
    if (!acc[sport]) {
      acc[sport] = [];
    }
    acc[sport].push(athlete);
    return acc;
  }, {} as Record<string, Athlete[]>);

  const sports = Object.keys(athletesByType);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Our Athletes"
          description="Meet the talented athletes representing Sierra Leone in swimming, diving, and water polo competitions."
          image="https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
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
        title="Our Athletes"
        description="Meet the talented athletes representing Sierra Leone in swimming, diving, and water polo competitions."
        image="https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      />

      <section className="section">
        <div className="container-custom">
          {sports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No athletes available.</p>
            </div>
          ) : (
            sports.map((sport) => (
              <div key={sport} className="mb-20">
                <h2 className="mb-8 capitalize">{sport.replace('-', ' ')} Athletes</h2>

                <motion.div 
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-100px" }}
                >
                  {athletesByType[sport].map((athlete) => (
                    <motion.div 
                      key={athlete.id} 
                      className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                        selectedAthlete === athlete.id ? 'lg:col-span-2' : ''
                      }`}
                      variants={item}
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="relative h-[400px]">
                          <img 
                            src={athlete.image || "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                            alt={athlete.name}
                            className="absolute inset-0 w-full h-full object-cover object-top"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h3 className="text-2xl font-semibold mb-1 text-white">{athlete.name}</h3>
                            <p className="text-gray-200 capitalize">
                              <Trophy size={16} className="inline mr-2" />
                              {athlete.sport?.replace('-', ' ') || 'Athlete'}
                            </p>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar size={16} className="mr-2" />
                              Born: {formatDate(athlete.date_of_birth)}
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin size={16} className="mr-2" />
                              Training: {athlete.training_base || 'Not specified'}
                            </div>

                            {athlete.specialties && (
                              <div>
                                <h4 className="font-semibold mb-2">Specialties</h4>
                                <div className="flex flex-wrap gap-2">
                                  {athlete.specialties.split('\n').map((specialty, index) => (
                                    <span 
                                      key={index}
                                      className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm"
                                    >
                                      {specialty}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {athlete.personal_bests && (
                              <div>
                                <h4 className="font-semibold mb-2">Personal Bests</h4>
                                <div className="space-y-2">
                                  {athlete.personal_bests.split('\n').map((pb, index) => (
                                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{pb.split(' - ')[0]}</span>
                                        <span className="text-sm text-primary-600 flex items-center">
                                          <Timer size={14} className="mr-1" />
                                          {pb.split(' - ')[1]}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {athlete.caps && (
                              <div>
                                <h4 className="font-semibold mb-2">International Caps</h4>
                                <ul className="space-y-1">
                                  {athlete.caps.split('\n').map((cap, index) => (
                                    <li key={index} className="text-sm text-gray-600 flex items-center">
                                      <Medal size={14} className="mr-2 text-yellow-500" />
                                      {cap}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => setSelectedAthlete(selectedAthlete === athlete.id ? null : athlete.id)}
                            className="mt-6 text-primary-600 hover:text-primary-700 font-medium text-sm"
                          >
                            {selectedAthlete === athlete.id ? 'Show Less' : 'Show More'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
};

export default AthletesPage;