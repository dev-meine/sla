import React, { useEffect } from 'react';
import { ArrowRight, Play, ChevronDown } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  // Parallax scroll effect
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, 50]); // Changed from negative to positive value
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);
  
  return (
    <section className="relative min-h-[100vh] overflow-hidden">
      {/* Background with modern gradient overlay */}
      <motion.div 
        style={{ opacity }}
        className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/85 to-blue-900/80 z-10"
      ></motion.div>
      
      {/* Animated wave background with parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y: y1 }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-900/30 to-transparent"></div>
        <svg className="absolute bottom-0 left-0 w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <motion.path 
            initial={{ opacity: 0.05 }}
            animate={{ opacity: 0.08 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            fill="#ffffff" 
            d="M0,192L48,176C96,160,192,128,288,122.7C384,117,480,139,576,165.3C672,192,768,224,864,213.3C960,203,1056,149,1152,138.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></motion.path>
        </svg>
        <svg className="absolute bottom-0 left-0 w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <motion.path 
            initial={{ opacity: 0.03 }}
            animate={{ opacity: 0.05 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
            fill="#ffffff" 
            d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,224C672,213,768,171,864,165.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></motion.path>
        </svg>
      </motion.div>
      
      {/* Hero image with parallax effect */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y: y2 }}
      >
        <img 
          src="https://i.ibb.co/9kDWFfBB/Screenshot-2025-05-14-at-2-02-57-AM-min.png"
          alt="Professional swimmers in competition" 
          className="w-full h-full object-cover"
        />
      </motion.div>
      
      {/* Content */}
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 h-full flex flex-col justify-center pt-32 pb-24">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <header>
            <motion.span 
              className="inline-block px-4 py-1.5 mb-6 bg-blue-500/20 text-blue-200 rounded-full text-sm font-medium tracking-wider"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              SIERRA LEONE AQUATICS
            </motion.span>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200">Diving Into</span> Excellence
            </motion.h1>
            
            <motion.span 
              className="block text-blue-100 text-lg md:text-xl mb-8 max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Empowering athletes, building champions, and promoting aquatic sports across Sierra Leone through world-class programs and competitions.
            </motion.span>
            
            <motion.nav 
              className="flex flex-wrap gap-4 items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link 
                to="/activities" 
                className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="flex items-center">
                  Our Programs
                  <motion.span 
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <ArrowRight size={16} className="ml-2" />
                  </motion.span>
                </span>
              </Link>
              <Link 
                to="/athletes" 
                className="group px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 rounded-full transition-all duration-300 flex items-center"
              >
                Meet Our Athletes
                <motion.span 
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ArrowRight size={16} className="ml-2" />
                </motion.span>
              </Link>
              <a 
                href="#watch-video" 
                className="flex items-center text-blue-100 hover:text-white transition-colors ml-2 group"
              >
                <motion.span 
                  className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-2"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Play size={14} fill="currentColor" />
                </motion.span>
                <span>Watch Video</span>
              </a>
            </motion.nav>
            
            <motion.aside
              className="mt-12 flex items-center space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
             
            </motion.aside>
          </header>
          
          <motion.figure 
            className="hidden lg:block"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <section className="relative">
              <span className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-300 rounded-2xl blur opacity-30"></span>
              <figure className="relative bg-blue-900/40 backdrop-blur-sm p-1 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                <img 
                  src="https://i.ibb.co/K3VFCBD/20240801-112429-min.jpg" 
                  alt="Sierra Leone swimming team" 
                  className="rounded-xl w-full h-full aspect-square object-cover"
                />
              </figure>
              <span className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/30 rounded-full blur-2xl"></span>
              <span className="absolute -top-4 -left-4 w-32 h-32 bg-cyan-300/20 rounded-full blur-2xl"></span>
            </section>
          </motion.figure>
        </section>
      </article>
        
        {/* Scroll indicator */}
        <motion.footer 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <span className="text-blue-200 text-sm mb-2">Scroll to explore</span>
          <motion.span
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
          >
            <ChevronDown className="text-blue-200" size={24} />
          </motion.span>
        </motion.footer>
    </section>
  );
};

export default HeroSection;