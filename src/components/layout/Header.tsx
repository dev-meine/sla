import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { navItems } from '../../data/navItems';
import { NavItem } from '../../types';
import Logo from '../ui/Logo';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-primary-500/10 py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center group" 
            onClick={closeMenu}
          >
            <motion.div 
              className="relative overflow-hidden"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Logo size={40} className="text-primary-600" />
            </motion.div>
            <div className="ml-4">
              <span className="font-heading font-bold text-slate-900 block leading-none group-hover:text-primary-600 transition-colors duration-300">SLA</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item: NavItem) => (
              <Link
                key={item.label}
                to={item.href}
                className={`relative font-sans text-xs uppercase tracking-widest font-bold transition-colors duration-300
                  ${isActive(item.href) 
                    ? 'text-primary-600' 
                    : 'text-slate-500 hover:text-primary-600'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link
                to="/admin"
                className="ml-4 inline-flex items-center justify-center bg-gradient-to-r from-primary-600 to-blue-500 text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)] font-sans text-xs uppercase tracking-widest font-semibold transition-all duration-300 hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
              >
                Admin Login
              </Link>
            </motion.div>
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden flex items-center justify-center p-2 text-slate-900 hover:text-primary-600 transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden absolute top-full left-0 right-0 overflow-hidden bg-white/95 backdrop-blur-xl border-b border-primary-500/10 shadow-xl"
          >
            <nav className="flex flex-col py-6 px-6 space-y-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`font-heading text-2xl font-bold transition-colors duration-300 ${
                    isActive(item.href)
                      ? 'text-primary-600'
                      : 'text-slate-900 hover:text-primary-600'
                  }`}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-6 border-t border-slate-100">
                <Link
                  to="/admin"
                  className="w-full inline-flex items-center justify-center bg-gradient-to-r from-primary-600 to-blue-500 text-white px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] font-sans text-sm uppercase tracking-widest font-semibold transition-colors duration-300"
                  onClick={closeMenu}
                >
                  Admin Login
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;