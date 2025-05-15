import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  return (
    <>
      <PageHeader
        title="About Us"
        description="Learn about the Sierra Leone Swimming, Diving & Water Polo Association."
        image="https://i.ibb.co/DPc6MhdS/20240430-165712-11zon.jpg"
      />

      <section className="section">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                FOUNDED IN FREETOWN – 10TH JUNE 1979
The Sierra Leone Swimming Federation is the national governing body for all Aquatic sports in Sierra Leone.
This includes but is not limited to Open Water Swimming, Surfing, Water Polo and Diving.
The Federation has sole rights for the organization, development, growth and promotion of these sports at all levels locally and internationally
              </p>
              <p className="text-gray-600 mb-4">
              We organize national championships, development programs, and represent Sierra Leone in international competitions.
              </p>
              <p className="text-gray-600">
                Our mission is to make aquatic sports accessible to all Sierra Leoneans, develop world-class athletes, and promote water safety throughout the country.
              </p>
            </motion.div>
            
            <motion.div
              className="rounded-lg overflow-hidden shadow-lg"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <img 
                src="https://images.pexels.com/photos/1415810/pexels-photo-1415810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Swimming competition" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="mb-6">Our Values</h2>
            <p className="text-lg text-gray-600">
              Our core values guide everything we do at the Sierra Leone Swimming, Diving & Water Polo Association.
            </p>
          </div>

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
                <h3 className="text-xl mb-3">African Swimming Confederation</h3>
                <p className="text-gray-600">
                  Active member of the continental governing body for aquatics in Africa
                </p>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl mb-3">Sierra Leone Olympic Committee</h3>
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