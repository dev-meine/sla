import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  return (
    <>
      <PageHeader
        title="About Us"
        description="Learn about Sierra Leone Aquatics"
        image="https://i.ibb.co/DPc6MhdS/20240430-165712-11zon.jpg"
      />

      <section className="section section-gradient relative overflow-hidden">
        {/* Enhanced background decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-400 to-blue-300 rounded-full opacity-15 blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full opacity-10 blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="container-custom relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="section-title mb-6 inline-block relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Our Story
              <motion.span 
                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: "8rem" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </motion.h2>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <motion.p 
                className="text-gray-700 mb-6 text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <span className="font-semibold text-blue-600">FOUNDED IN FREETOWN – 10TH JUNE 1979</span> as
                The Sierra Leone Swimming, Diving & Water Polo Association, now known as the Sierra Leone Swimming Federation, is the national governing body for all Aquatic sports in Sierra Leone.
              </motion.p>
              <motion.p 
                className="text-gray-700 mb-6 text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                This includes but is not limited to Open Water Swimming, Surfing, Water Polo and Diving.
                The Federation has sole rights for the organization, development, growth and promotion of these sports at all levels locally and internationally.
              </motion.p>
              <motion.p 
                className="text-gray-700 mb-6 text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                We organize national championships, development programs, and represent Sierra Leone in international competitions.
              </motion.p>
              <motion.p 
                className="text-gray-700 text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
              >
                Our mission is to make aquatic sports accessible to all Sierra Leoneans, develop world-class athletes, and promote water safety throughout the country.
              </motion.p>
            </motion.div>
            
            <motion.div
              className="rounded-xl overflow-hidden shadow-2xl relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent z-10"></div>
              <img 
                src="https://i.ibb.co/9kDWFfBB/Screenshot-2025-05-14-at-2-02-57-AM-min.png" 
                alt="Swimming competition" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section section-gradient relative overflow-hidden">
        {/* Modern background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white to-cyan-50/30"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-blue-300/20 to-cyan-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-cyan-300/15 to-blue-200/15 rounded-full blur-3xl"></div>
        
        <div className="container-custom relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="mb-8 text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Our Values
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-700 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Our core values guide everything we do at the Sierra Leone Aquatics.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl mb-3">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in all aspects of our operations, from athlete development to event organization.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl mb-3">Inclusion</h3>
              <p className="text-gray-600">
                We believe aquatic sports should be accessible to all Sierra Leoneans regardless of background or ability.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl mb-3">Integrity</h3>
              <p className="text-gray-600">
                We uphold the highest standards of fairness, transparency, and ethical conduct in all our activities.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">4</span>
              </div>
              <h3 className="text-xl mb-3">Community</h3>
              <p className="text-gray-600">
                We foster a supportive community that encourages growth, collaboration, and national pride.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="mb-6">Our Affiliations</h2>
            <p className="text-lg text-gray-600 mb-12">
              We are proud to be affiliated with the following organizations:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl mb-3">World Aquatics</h3>
                <p className="text-gray-600">
                  Officially recognized member federation of the international governing body for aquatics sports
                </p>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl mb-3">African Aquatics</h3>
                <p className="text-gray-600">
                  Active member of the continental governing body for aquatics in Africa
                </p>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl mb-3">Sierra Leone National Olympic Committee</h3>
                <p className="text-gray-600">
                  National Olympic Committee member responsible for Olympic qualification
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;