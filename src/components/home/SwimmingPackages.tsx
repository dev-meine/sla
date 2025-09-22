import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Medal, Clock, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';

type SwimmingPackage = Database['public']['Tables']['swimming_packages']['Row'];

const SwimmingPackages: React.FC = () => {
  const [packages, setPackages] = useState<SwimmingPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('swimming_packages')
        .select('*')
        .order('price');
      
      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
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
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section relative overflow-hidden bg-gradient-to-b from-blue-50 to-gray-50">
      <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-5"></div>
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-primary-100/30 to-blue-100/20 blur-3xl"></div>
      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <h2 className="mb-4">Swimming Lessons</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join our swimming programs and learn from experienced instructors in a safe and supportive environment.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {packages.map((pkg) => (
            <motion.div 
              key={pkg.id} 
              className="relative backdrop-blur-sm bg-white/30 rounded-xl overflow-hidden group transition-all duration-300 hover:scale-[1.02] border border-white/20"
              variants={item}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100/30 to-primary-300/10 opacity-50 z-0"></div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-300/20 to-blue-300/20 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
              
              <div className="relative p-8 z-10">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-300/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-300/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
                
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">{pkg.name}</h3>
                <p className="text-gray-700 mb-6">{pkg.description}</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-gray-700 bg-white/40 p-2 rounded-lg backdrop-blur-sm">
                    <Medal className="w-5 h-5 mr-3 text-primary-600" />
                    <span>Professional instruction</span>
                  </div>
                  <div className="flex items-center text-gray-700 bg-white/40 p-2 rounded-lg backdrop-blur-sm">
                    <Clock className="w-5 h-5 mr-3 text-primary-600" />
                    <span>Flexible scheduling</span>
                  </div>
                  <div className="flex items-center text-gray-700 bg-white/40 p-2 rounded-lg backdrop-blur-sm">
                    <Users className="w-5 h-5 mr-3 text-primary-600" />
                    <span>Small group sizes</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Starting from</p>
                    <p className="text-3xl font-bold text-primary-600">
                      Le {pkg.price.toLocaleString()}
                    </p>
                  </div>
                  <Link 
                    to="/register" 
                    className="relative btn btn-primary bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 overflow-hidden group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center">
                      Register Now
                      <ArrowRight size={16} className="ml-2" />
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SwimmingPackages;