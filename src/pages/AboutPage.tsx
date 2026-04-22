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

      {/* Our Story */}
      <section className="section bg-white">
        <div className="container-custom">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-slate-900 mb-4">Our Story</h2>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <p className="text-slate-600 text-lg leading-relaxed">
                <span className="font-semibold text-slate-900">Founded in Freetown on 10th June 1979</span>, the Sierra Leone Swimming, Diving & Water Polo Association, now known as Sierra Leone Aquatics, is the national governing body for all aquatic sports in Sierra Leone.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                This includes but is not limited to Open Water Swimming, Surfing, Water Polo and Diving. The Federation has sole rights for the organization, development, growth and promotion of these sports at all levels locally and internationally.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                We organize national championships, development programs, and represent Sierra Leone in international competitions.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                Our mission is to make aquatic sports accessible to all Sierra Leoneans, develop world-class athletes, and promote water safety throughout the country.
              </p>
            </motion.div>
            
            <motion.div
              className="rounded-2xl overflow-hidden border border-slate-100"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <img 
                src="https://i.ibb.co/9kDWFfBB/Screenshot-2025-05-14-at-2-02-57-AM-min.png" 
                alt="Swimming competition" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Values — Bento Grid */}
      <section className="section bg-slate-50">
        <div className="container-custom">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-slate-900 mb-4">What Drives Us</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Our mission, vision, and core values guide everything we do.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Vision — spans 2 cols */}
            <motion.div
              className="bg-white rounded-2xl p-10 border border-slate-100 md:col-span-2 flex flex-col justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <span className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-3">Vision</span>
              <p className="text-2xl font-semibold text-slate-900 leading-snug">
                To be recognized as the country's leading sport discipline in the development of youth athletes.
              </p>
            </motion.div>

            {/* Mission — spans 2 cols */}
            <motion.div
              className="bg-slate-900 text-white rounded-2xl p-10 border border-slate-800 md:col-span-2 flex flex-col justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <span className="text-xs font-bold uppercase tracking-widest text-primary-400 mb-3">Mission</span>
              <p className="text-2xl font-semibold leading-snug">
                To develop champions in aquatic sports and life.
              </p>
            </motion.div>

            {/* Values — 4 individual cards */}
            {[
              { title: 'Excellence', text: 'We strive for excellence in all aspects, from athlete development to event organization.' },
              { title: 'Inclusion', text: 'Aquatic sports should be accessible to all Sierra Leoneans regardless of background.' },
              { title: 'Integrity', text: 'We uphold the highest standards of fairness, transparency, and ethical conduct.' },
              { title: 'Community', text: 'We foster a supportive community that encourages growth and national pride.' },
            ].map((value, i) => (
              <motion.div 
                key={value.title}
                className="bg-white p-8 rounded-2xl border border-slate-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{value.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Affiliations */}
      <section className="section bg-slate-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-slate-900 mb-4">Our Affiliations</h2>
            <p className="text-lg text-slate-600">
              We are proud to be affiliated with the following organizations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 border border-slate-100 rounded-2xl">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">World Aquatics</h3>
              <p className="text-slate-600">
                Officially recognized member federation of the international governing body for aquatics sports.
              </p>
            </div>
            
            <div className="bg-white p-8 border border-slate-100 rounded-2xl">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">African Aquatics</h3>
              <p className="text-slate-600">
                Active member of the continental governing body for aquatics in Africa.
              </p>
            </div>
            
            <div className="bg-white p-8 border border-slate-100 rounded-2xl">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Sierra Leone NOC</h3>
              <p className="text-slate-600">
                National Olympic Committee member responsible for Olympic qualification.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;