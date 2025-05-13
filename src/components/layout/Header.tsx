import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
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
      if (window.scrollY > 50) {
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
          ? 'bg-white shadow-md py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center" onClick={closeMenu}>
            <Logo size={40} />
            <div className="ml-2">
              <span className="font-heading font-bold text-lg text-primary-600 block leading-tight">SLA</span>
              <span className="text-xs text-gray-600 block leading-tight">Sierra Leone Aquatics</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item: NavItem) => (
              <Link
                key={item.label}
                to={item.href}
                className={`nav-link ${isActive(item.href) ? 'nav-link-active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/admin"
              className="btn btn-primary py-2 px-4"
            >
              Admin Login
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-full left-0 right-0">
          <nav className="container-custom py-4 flex flex-col space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`py-2 px-4 ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700'
                } rounded-md`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100">
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