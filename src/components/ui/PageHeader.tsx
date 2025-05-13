import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  description?: string;
  image?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description,
  image = "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
}) => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-primary-600">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/3 -left-20 w-64 h-64 bg-secondary-300 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      {/* Content */}
      <div className="container-custom relative z-10">
        <div className="max-w-3xl">
          <motion.h1 
            className="text-white mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h1>
          
          {description && (
            <motion.p 
              className="text-gray-100 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>
      
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      
     
    </section>
  );
};

export default PageHeader;