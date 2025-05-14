import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import Logo from '../ui/Logo';
import { navItems } from '../../data/navItems';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary-600 text-white">
      <div className="wave-bg">
        <div className="container-custom pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About Section */}
            <div>
              <div className="flex items-center mb-4">
                <Logo size={40} color="#ffffff" />
                <div className="ml-2">
                  <span className="font-heading font-bold text-lg block leading-tight">SLA</span>
                  <span className="text-xs text-gray-200 block leading-tight">Sierra Leone Aquatics</span>
                </div>
              </div>
              <p className="text-gray-200 mb-4">
                Promoting Aquatics Sports and Activities through through development programs and competitions.
              </p>
              <div className="flex space-x-3 mt-4">
                <a href="https://www.facebook.com/p/Sierra-Leone-Swimming-Federation-100070148070104/" target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-all">
                  <Facebook size={18} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-all">
                  <Instagram size={18} />
                </a>
                <a href="https://x.com/sle_polo" target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-all">
                  <Twitter size={18} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-all">
                  <Youtube size={18} />
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-heading font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-gray-200 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-heading font-semibold mb-4 text-white">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin size={18} className="mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-200">National Stadium, Freetown, Sierra Leone</span>
                </li>
                <li className="flex items-center">
                  <Phone size={18} className="mr-2 flex-shrink-0" />
                  <span className="text-gray-200">+232 79 905047</span>
                </li>
                <li className="flex items-center">
                  <Mail size={18} className="mr-2 flex-shrink-0" />
                  <a href="mailto:info@slsdwa.org" className="text-gray-200 hover:text-white transition-colors">saloneswim@gmail.com</a>
                </li>
              </ul>
            </div>
            
            {/* Newsletter */}
            <div>
              <h3 className="text-xl font-heading font-semibold mb-4 text-white">Newsletter</h3>
              <p className="text-gray-200 mb-4">Subscribe to receive updates on events and news.</p>
              <form className="flex flex-col space-y-2">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="px-4 py-2 rounded-md bg-white bg-opacity-20 border border-white border-opacity-20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30"
                />
                <button 
                  type="submit" 
                  className="bg-white text-primary-600 font-medium px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="mt-12 pt-6 border-t border-white border-opacity-20 text-center text-gray-300 text-sm">
            <p>© {currentYear} Sierra Leone Swimming Federation. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;