import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Medal, Calendar, MapPin, Trophy, Timer } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { useParams } from 'react-router-dom';

type Athlete = Database['public']['Tables']['athletes']['Row'];

const AthletesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAthlete, setCurrentAthlete] = useState<Athlete | null>(null);

  useEffect(() => {
    console.log('useEffect triggered, id:', id);
    if (id) {
      fetchAthlete(id);
    } else {
      fetchAthletes();
    }
  }, [id]);

  const fetchAthlete = async (athleteId: string) => {
    try {
      const { data, error } = await supabase
        .from('athletes')
        .select('*')
        .eq('id', athleteId)
        .single();

      if (error) throw error;
      setCurrentAthlete(data || null);
    } catch (error) {
      console.error('Error fetching athlete:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAthletes = async () => {
    console.log('Fetching all athletes...');
    try {
      const { data, error } = await supabase
        .from('athletes')
        .select('*')
        .order('name');
      
      if (error) throw error;
      console.log('Fetched athletes:', data);
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
          title={id ? "Athlete Profile" : "Our Athletes"}
          description={id ? "Loading athlete profile..." : "Meet the talented athletes representing Sierra Leone in swimming, diving, and water polo competitions."}
          image="https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        />
        <section className="section section-gradient">
          <div className="container-custom">
            <div className="text-center">
              <motion.div 
                className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </section>
      </>
    );
  }

  if (id && !currentAthlete) {
    return (
      <>
        <PageHeader
          title="Athlete Not Found"
          description="The athlete you are looking for does not exist."
          image="https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        />
        <section className="section section-gradient">
          <div className="container-custom">
            <div className="text-center py-12">
              <p className="text-gray-600">No athlete found with the provided ID.</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={id ? currentAthlete?.name : "Our Athletes"}
        description={id ? `Profile of ${currentAthlete?.name}` : "Meet the talented athletes representing Sierra Leone in swimming, diving, and water polo competitions."}
        image="https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      />

      <section className="section section-gradient">
        <div className="container-custom">
          {id && currentAthlete ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden lg:grid lg:grid-cols-2"
            >
              <div className="relative h-[400px] lg:h-auto">
                <img
                  src={currentAthlete.image || "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                  alt={currentAthlete.name}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-semibold mb-1 text-white">{currentAthlete.name}</h3>
                  <p className="text-gray-200 capitalize">
                    <Trophy size={16} className="inline mr-2" />
                    {currentAthlete.sport?.replace('-', ' ') || 'Athlete'}
                  </p>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Personal Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={16} className="mr-2" />
                      Born: {formatDate(currentAthlete.date_of_birth)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      Training: {currentAthlete.training_base || 'Not specified'}
                    </div>
                  </div>
                </div>

                {currentAthlete.specialties && (
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentAthlete.specialties.split('\n').map((specialty, index) => (
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

                {currentAthlete.personal_bests && (
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Personal Bests</h4>
                    <div className="space-y-2">
                      {currentAthlete.personal_bests.split('\n').map((pb, index) => (
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

                {currentAthlete.biography && (
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Biography</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{currentAthlete.biography}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            sports.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-gray-600">No athletes available.</p>
              </motion.div>
            ) : (
              sports.map((sport) => (
                <motion.div 
                  key={sport} 
                  className="mb-20"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7 }}
                >
                  <motion.h2 
                    className="mb-8 capitalize"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {sport.replace('-', ' ')} Athletes
                  </motion.h2>

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

                              <div className="mt-4">
                                <button
                                  onClick={() => setSelectedAthlete(athlete.id === selectedAthlete ? null : athlete.id)}
                                  className="text-primary-600 hover:text-primary-800 font-medium text-sm flex items-center"
                                >
                                  {athlete.id === selectedAthlete ? (
                                    <>View Less <ChevronUp size={16} className="ml-1" /></>
                                  ) : (
                                    <>View Profile <ChevronDown size={16} className="ml-1" /></>
                                  )}
                                </button>
                              </div>

                              {selectedAthlete === athlete.id && athlete.biography && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3, ease: 'easeOut' }}
                                  className="mt-4 text-gray-700 text-sm leading-relaxed"
                                >
                                  <h4 className="font-semibold mb-2">Biography</h4>
                                  <p>{athlete.biography}</p>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              ))
            )
          )}
        </div>
      </section>
    </>
  );
};

export default AthletesPage;