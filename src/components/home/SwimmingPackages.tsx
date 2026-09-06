import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
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
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  if (isLoading) {
    return (
      <section className="bg-white py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-24 md:py-32 relative overflow-hidden border-t border-slate-100">

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full font-sans tracking-widest text-xs uppercase font-bold mb-4 shadow-sm"
          >
            Training
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-6 relative"
          >
            Swimming Lessons
            <span className="absolute -bottom-3 left-1/4 w-1/2 h-1.5 bg-secondary-400 rounded-full"></span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-sans text-slate-600 text-lg font-medium leading-relaxed max-w-2xl mx-auto mt-4"
          >
            Join our expert-led swimming programs. Master your technique in a supportive environment, structured for all skill levels.
          </motion.p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12 relative"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {packages.map((pkg, index) => {
            const isFeatured = index === 1; // Highlight the middle package usually
            
            return (
              <motion.div 
                key={pkg.id} 
                className={`bg-white rounded-[2rem] flex flex-col h-full p-8 lg:p-10 relative overflow-hidden group ring-1 ${
                  isFeatured 
                    ? 'ring-primary-400 shadow-md md:-translate-y-4' 
                    : 'ring-slate-100 shadow-sm'
                } hover:shadow-lg transition-all duration-500`}
                variants={item}
                whileHover={{ y: isFeatured ? -24 : -12 }}
              >
                
                {/* Ribbon removed per user request */}

                <div className="mb-8 relative z-10 pt-4">
                  <h3 className="font-heading text-2xl font-bold text-slate-900 mb-4">{pkg.name}</h3>
                  <p className="font-sans text-slate-500 font-medium text-sm h-16 line-clamp-3">
                    {pkg.description}
                  </p>
                </div>

                <div className="mb-8 pb-8 border-b border-slate-100 relative z-10">
                  <span className="block text-slate-400 font-sans text-xs uppercase tracking-widest mb-2 font-bold">Starting at</span>
                  <div className="flex items-baseline text-primary-600">
                    <span className="font-heading text-4xl md:text-5xl font-bold relative inline-block">
                      Le {pkg.price.toLocaleString()}
                      {isFeatured && <div className="absolute -bottom-1 left-0 w-full h-1/3 bg-secondary-200/40 -z-10 rounded"></div>}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-10 flex-grow relative z-10">
                  <div className="flex items-start">
                     <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-3 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-primary-600" />
                    </span>
                    <span className="font-sans text-slate-700 font-medium text-sm">Professional instruction</span>
                  </div>
                  <div className="flex items-start">
                     <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-3 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-primary-600" />
                    </span>
                    <span className="font-sans text-slate-700 font-medium text-sm">Flexible scheduling options</span>
                  </div>
                  <div className="flex items-start">
                     <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-3 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-primary-600" />
                    </span>
                    <span className="font-sans text-slate-700 font-medium text-sm">Small group sizes for focus</span>
                  </div>
                </div>
                
                <div className="mt-auto relative z-10">
                  <Link 
                    to="/register" 
                    className={`w-full flex items-center justify-center font-sans font-bold py-4 px-6 rounded-2xl transition-all duration-300 group overflow-hidden relative active:scale-95 ${
                      isFeatured 
                        ? 'bg-primary-600 text-white hover:bg-primary-700' 
                        : 'bg-white text-primary-700 ring-2 ring-primary-100 hover:ring-primary-500 hover:bg-primary-50'
                    }`}
                  >
                    <span className="uppercase tracking-widest text-xs relative z-10">Register Now</span>
                    <ArrowRight size={16} className={`ml-3 relative z-10 transition-transform group-hover:translate-x-1 ${isFeatured ? 'text-white/70' : 'text-primary-500'}`} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default SwimmingPackages;