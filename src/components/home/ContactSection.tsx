import React from 'react';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="section section-dark relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400 rounded-full opacity-10 blur-3xl translate-y-1/2 -translate-x-1/4"></div>
      
      <div className="container-custom relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title text-white mb-4 inline-block">
            Get In Touch
            <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full"></span>
          </h2>
          <p className="text-blue-100 text-lg max-w-3xl mx-auto mt-8">
            Have questions about our programs, events, or how to get involved? Reach out to us anytime.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div 
            className="bg-white/10 rounded-xl p-8 backdrop-blur-sm border border-white/5 hover:bg-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 group"
            variants={itemVariants}
          >
            <div className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <MapPin size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Our Location</h3>
            <p className="text-blue-100">National Stadium, Freetown, Sierra Leone</p>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-cyan-300 mt-4 hover:text-cyan-200 transition-colors">
              View on map <ExternalLink size={14} className="ml-1" />
            </a>
          </motion.div>
          
          <motion.div 
            className="bg-white/10 rounded-xl p-8 backdrop-blur-sm border border-white/5 hover:bg-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 group"
            variants={itemVariants}
          >
            <div className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Phone size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Phone Number</h3>
            <p className="text-blue-100">+232 79 905047</p>
            <a href="tel:+23279905047" className="inline-flex items-center text-cyan-300 mt-4 hover:text-cyan-200 transition-colors">
              Call us <ExternalLink size={14} className="ml-1" />
            </a>
          </motion.div>
          
          <motion.div 
            className="bg-white/10 rounded-xl p-8 backdrop-blur-sm border border-white/5 hover:bg-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 group"
            variants={itemVariants}
          >
            <div className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Mail size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Email Address</h3>
            <p className="text-blue-100">info@saloneswim.com</p>
            <a href="mailto:info@saloneswim.com" className="inline-flex items-center text-cyan-300 mt-4 hover:text-cyan-200 transition-colors">
              Send email <ExternalLink size={14} className="ml-1" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;