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
    <section className="relative py-14 md:py-20 overflow-hidden bg-slate-950">
      
      {/* Content */}
      <div className="container-custom relative z-10">
        <div className="max-w-3xl">
          <motion.h1 
            className="text-white font-heading text-3xl md:text-5xl font-bold tracking-tight mb-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h1>
          
          {description && (
            <motion.p 
              className="text-slate-200 text-base md:text-lg max-w-2xl font-normal leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>
      
      {/* Background image with cinematic overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover opacity-30"
          width="1280" 
          height="720"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/80 pointer-events-none"></div>
      </div>
      
     
    </section>
  );
};

export default PageHeader;