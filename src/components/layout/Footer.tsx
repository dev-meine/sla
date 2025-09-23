import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone, ArrowRight, Send } from 'lucide-react';
import Logo from '../ui/Logo';
import { navItems } from '../../data/navItems';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-br from-blue-800 to-blue-900 text-white relative overflow-hidden">
      {/* Wave SVG Overlay */}
      <div className="absolute top-0 left-0 w-full opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path fill="#ffffff" fillOpacity="1" d="M0,192L48,176C96,160,192,128,288,122.7C384,117,480,139,576,165.3C672,192,768,224,864,213.3C960,203,1056,149,1152,138.7C1248,128,1344,160,1392,176L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* About Section */}
          <div className="lg:col-span-4">
            <div className="flex items-center mb-5">
              <Logo size={48} color="#ffffff" />
              <div className="ml-3">
                <span className="font-heading font-bold text-xl block leading-tight">SLA</span>
                <span className="text-xs text-blue-200 block leading-tight tracking-wider">Sierra Leone Aquatics</span>
              </div>
            </div>
            <p className="text-blue-100 mb-6 leading-relaxed">
              Promoting Aquatics Sports and Activities through development programs and competitions across Sierra Leone.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="https://www.facebook.com/p/Sierra-Leone-Swimming-Federation-100070148070104/" target="_blank" rel="noopener noreferrer" 
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20">
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20">
                <Instagram size={18} />
              </a>
              <a href="https://x.com/sle_polo" target="_blank" rel="noopener noreferrer" 
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20">
                <Twitter size={18} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" 
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20">
                <Youtube size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-heading font-semibold mb-5 text-white relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-10 after:h-1 after:bg-blue-400 after:rounded-full">Quick Links</h3>
            <ul className="space-y-3 mt-6">
              {navItems.slice(0, 5).map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-blue-100 hover:text-white transition-colors duration-200 flex items-center group">
                    <ArrowRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* More Links */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-heading font-semibold mb-5 text-white relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-10 after:h-1 after:bg-blue-400 after:rounded-full">More</h3>
            <ul className="space-y-3 mt-6">
              {navItems.slice(5).map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-blue-100 hover:text-white transition-colors duration-200 flex items-center group">
                    <ArrowRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-heading font-semibold mb-5 text-white relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-10 after:h-1 after:bg-blue-400 after:rounded-full">Contact Us</h3>
            <ul className="space-y-4 mt-6">
              <li className="flex items-start">
                <MapPin size={18} className="mr-3 mt-1 flex-shrink-0 text-blue-300" />
                <span className="text-blue-100">National Stadium, Freetown, Sierra Leone</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-3 flex-shrink-0 text-blue-300" />
                <span className="text-blue-100">+232 79 905047</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-3 flex-shrink-0 text-blue-300" />
                <a href="mailto:saloneswim@gmail.com" className="text-blue-100 hover:text-white transition-colors">saloneswim@gmail.com</a>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-heading font-semibold mb-5 text-white relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-10 after:h-1 after:bg-blue-400 after:rounded-full">Newsletter</h3>
            
            <form className="relative">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors duration-300"
                aria-label="Subscribe"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-16 pt-6 border-t border-white/20 text-center text-blue-200 text-sm">
          <p>© {currentYear} Sierra Leone Swimming Federation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;