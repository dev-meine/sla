import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../ui/Logo';
import { navItems } from '../../data/navItems';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };
  
  return (
    <footer className="bg-slate-950 text-white font-sans border-t border-slate-800/60 relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 pt-24 pb-12 relative z-10">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-8 mb-24"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          
          {/* Brand & About Column */}
          <motion.div className="md:col-span-12 lg:col-span-5" variants={itemVariants}>
            <Link to="/" className="inline-block mb-8 group">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }}>
                <Logo size={48} color="#ffffff" />
              </motion.div>
            </Link>
            <h2 className="font-heading text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Sierra Leone Aquatics
            </h2>
            <p className="font-sans text-slate-400 font-medium leading-relaxed max-w-sm mb-10">
              Promoting excellence in swimming, diving, and water polo through dedicated development programs and competitions across Sierra Leone.
            </p>
            
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: "https://www.facebook.com/p/Sierra-Leone-Swimming-Federation-100070148070104/", label: "Facebook" },
                { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                { icon: Twitter, href: "https://x.com/sle_polo", label: "Twitter" },
                { icon: Youtube, href: "https://youtube.com", label: "YouTube" }
              ].map((social, i) => (
                <motion.a 
                  key={i}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary-600 border border-slate-700/50 hover:border-primary-500 transition-all duration-300"
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="sr-only">{social.label}</span>
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>
          
          {/* Menu Column */}
          <motion.div className="md:col-span-4 lg:col-span-3" variants={itemVariants}>
            <h3 className="font-sans text-xs uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
              <span className="w-2 h-2 rounded-full bg-secondary-500 mr-2"></span>
              Navigation
            </h3>
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-slate-300 hover:text-primary-400 font-medium transition-colors duration-300 inline-flex items-center group">
                    <motion.span whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                      {item.label}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Contact Column */}
          <motion.div className="md:col-span-8 lg:col-span-4" variants={itemVariants}>
            <h3 className="font-sans text-xs uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span>
              Contact
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start group">
                <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-primary-900/50 group-hover:text-primary-400 transition-colors">
                  <MapPin size={14} className="text-slate-400 group-hover:text-primary-400 transition-colors" />
                </div>
                <span className="text-slate-300 font-medium leading-relaxed pt-1">National Stadium, Freetown, Sierra Leone</span>
              </li>
              <li className="flex items-center group">
                <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-primary-900/50 group-hover:text-primary-400 transition-colors">
                  <Phone size={14} className="text-slate-400 group-hover:text-primary-400 transition-colors" />
                </div>
                <span className="text-slate-300 font-medium">+232 79 905047</span>
              </li>
              <li className="flex items-center group">
                <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-primary-900/50 group-hover:text-primary-400 transition-colors">
                  <Mail size={14} className="text-slate-400 group-hover:text-primary-400 transition-colors" />
                </div>
                <a href="mailto:saloneswim@gmail.com" className="text-slate-300 hover:text-primary-400 font-medium transition-colors">saloneswim@gmail.com</a>
              </li>
            </ul>

            <div className="mt-10">
              <h3 className="font-sans text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">Newsletter</h3>
              <form className="relative flex items-center bg-slate-900 border border-slate-800 rounded-full p-1 focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-transparent text-white placeholder:text-slate-500 font-medium text-sm focus:outline-none focus:ring-0 px-4"
                  required
                />
                <button 
                  type="submit" 
                  className="w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-500 flex items-center justify-center text-white transition-colors duration-300 flex-shrink-0 group"
                  aria-label="Subscribe"
                >
                  <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
          
        </motion.div>
        
        {/* Bottom Bar */}
        <motion.div 
          className="pt-8 border-t border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <p className="text-slate-500 text-sm font-medium">
            © {currentYear} Sierra Leone Aquatics. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm font-medium text-slate-500">
            <Link to="#" className="hover:text-primary-400 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-primary-400 transition-colors">Terms of Service</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;