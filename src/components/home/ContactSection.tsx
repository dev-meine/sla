import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactSection: React.FC = () => {
  return (
    <section className="section bg-primary-600 text-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-white mb-4">Get In Touch</h2>
          <p className="text-gray-100 text-lg max-w-3xl mx-auto">
            Have questions about our programs, events, or how to get involved? Reach out to us anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
            <div className="bg-white text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <MapPin size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Our Location</h3>
            <p className="text-gray-200">National Stadium, Freetown, Sierra Leone</p>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
            <div className="bg-white text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Phone size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Phone Number</h3>
            <p className="text-gray-200">+232 79 905047</p>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
            <div className="bg-white text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Mail size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Email Address</h3>
            <p className="text-gray-200">info@saloneswim.com</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;