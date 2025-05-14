import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="relative h-screen max-h-[800px] overflow-hidden bg-gradient-to-b from-primary-600 to-primary-700">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/3 -left-20 w-64 h-64 bg-secondary-300 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      {/* Content */}
      <div className="container-custom relative z-10 h-full flex flex-col justify-center items-start">
        <div className="max-w-2xl">
          <motion.h1 
            className="text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Diving Into Excellence with Sierra Leone Aquatics
          </motion.h1>
          
          <motion.p 
            className="text-gray-100 text-lg mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Empowering athletes, building champions, and promoting aquatic sports across Sierra Leone through world-class programs, competitions, and facilities.
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/activities" className="btn btn-secondary">
              Our Programs
            </Link>
            <Link to="/athletes" className="btn bg-white text-primary-600 hover:bg-gray-100">
              Meet Our Athletes
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Hero image with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/19558567/pexels-photo-19558567.jpeg"
          alt="Olympic swimming pool with athletes ready to compete" 
          className="w-full h-full object-cover opacity-30"
        />
      </div>
    </section>
  );
};

export default HeroSection;