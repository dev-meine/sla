import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -50]);

  return (
    <section className="relative min-h-[100vh] bg-transparent overflow-hidden flex items-center pt-24 pb-12">

      <article className="container mx-auto px-6 lg:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          <header className="lg:col-span-6 flex flex-col justify-center mt-12 md:mt-20 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 leading-[1.05] tracking-tight mb-8">
                <motion.span 
                  initial={{ opacity: 0, y: 50, rotate: -2 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                  className="inline-block"
                >Diving</motion.span>{" "}
                <motion.span 
                  initial={{ opacity: 0, y: 50, rotate: 2 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                  className="inline-block"
                >Into</motion.span> <br />
                <motion.span 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
                  className="text-primary-600 relative inline-block drop-shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                >
                  Excellence
                  {/* Energetic underline accent */}
                  <motion.span 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.8, ease: "circOut" }}
                    className="absolute bottom-2 left-0 w-full h-4 bg-secondary-400/40 -z-10 origin-left rounded-r-full" 
                  />
                </motion.span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="font-sans text-slate-600 text-lg md:text-xl md:leading-relaxed max-w-lg mb-10 font-medium"
              >
                Empowering athletes, building champions, and promoting aquatic sports across Sierra Leone through world-class programs and competitions.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap gap-6 items-center"
              >
                <Link 
                  to="/activities" 
                  className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-500 text-white font-sans font-bold uppercase tracking-wider text-sm rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all duration-300 flex items-center transform hover:scale-105 active:scale-95"
                >
                  Our Programs
                  <motion.span 
                    initial={{ x: 0 }}
                    whileHover={{ x: 6 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <ArrowRight size={18} className="ml-3" />
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
          </header>
          
          <div className="lg:col-span-6 relative h-[50vh] lg:h-[80vh] w-full mt-12 lg:mt-0">
            <motion.div 
              className="absolute top-[10%] right-0 w-[85%] h-[75%] lg:w-[90%] lg:h-[80%] z-0 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-white/50"
              style={{ y: y1 }}
              initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            >
              <div className="w-full h-full bg-slate-200 overflow-hidden relative group">
                <img 
                  src="https://i.ibb.co/9kDWFfBB/Screenshot-2025-05-14-at-2-02-57-AM-min.png"
                  alt="Professional swimmers in competition" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] ease-out filter contrast-125 saturate-110"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/20 to-transparent mix-blend-overlay"></div>
              </div>
            </motion.div>

            <motion.div 
              className="absolute bottom-0 left-0 w-[55%] h-[45%] lg:w-2/3 lg:h-[50%] z-10 rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.2)] ring-4 ring-white"
              style={{ y: y2 }}
              initial={{ opacity: 0, x: -30, rotate: -5 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.5 }}
            >
              <div className="w-full h-full bg-white relative group">
                <div className="w-full h-full overflow-hidden relative">
                  <img 
                    src="https://i.ibb.co/K3VFCBD/20240801-112429-min.jpg" 
                    alt="Sierra Leone swimming team" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] ease-out filter contrast-110 saturate-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent mix-blend-overlay opacity-50"></div>
                </div>
              </div>
            </motion.div>
          </div>
          
        </div>
      </article>

      {/* Clean scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-12 flex items-center space-x-3 hidden md:flex"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <span className="text-slate-400 font-sans text-xs tracking-widest uppercase font-bold">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-0.5 h-10 bg-gradient-to-b from-primary-500 to-transparent rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;