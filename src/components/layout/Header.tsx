import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { navItems } from '../../data/navItems';
import { NavItem } from '../../types';
import Logo from '../ui/Logo';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-sm py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center group" 
            onClick={closeMenu}
          >
            <div className="relative overflow-hidden">
              <Logo size={44} className="transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300"></div>
            </div>
            <div className="ml-3">
              <span className="font-heading font-bold text-xl text-blue-600 block leading-tight tracking-tight">SLA</span>
              <span className="text-xs text-gray-600 block leading-tight tracking-wide">Sierra Leone Aquatics</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item: NavItem) => (
              <Link
                key={item.label}
                to={item.href}
                className={`relative px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out
                  ${isActive(item.href) 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/50'
                  }
                  after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 
                  after:w-0 after:h-0.5 after:bg-blue-500 after:transition-all after:duration-300
                  ${isActive(item.href) ? 'after:w-1/2' : 'hover:after:w-1/3'}
                `}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/admin"
              className="ml-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:from-blue-700 hover:to-blue-600 hover:shadow-md focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              Admin Login
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm shadow-lg absolute top-full left-0 right-0 border-t border-gray-100">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`py-3 px-4 ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-600 rounded-xl font-medium'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-500 rounded-xl'
                } transition-all duration-200 flex items-center justify-between`}
                onClick={closeMenu}
              >
                <span>{item.label}</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isActive(item.href) ? 'rotate-180 text-blue-500' : ''}`} />
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100">
              <Link
                to="/admin"
                className="block w-full py-2 px-4 text-center bg-primary-600 text-white rounded-md"
                onClick={closeMenu}
              >
                Admin Login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;