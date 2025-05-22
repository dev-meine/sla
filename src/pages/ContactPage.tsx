import React, { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import ContactForm from '../components/contact/ContactForm';
import AnonymousReportForm from '../components/contact/AnonymousReportForm';
import { MapPin, Phone, Mail, Clock, AlertTriangle } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [showReportForm, setShowReportForm] = useState(false);

  return (
    <>
      <PageHeader
        title="Contact Us"
        description="Get in touch with us, we'd love to hear from you!"
        image="https://i.ibb.co/K3VFCBD/20240801-112429-min.jpg"
      />

      <section className="section">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="mb-6">Get In Touch</h2>
              <p className="text-gray-600 mb-8">
                Have questions or want to learn more about our programs? Feel free to contact us using the information below or by filling out the contact form.
              </p>
              
              <div className="space-y-6">
                <div className="flex">
                  <div className="mt-1 mr-4 text-primary-600 p-3 rounded-full">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Our Location</h3>
                    <p className="text-gray-600">Top floor</p>
                    <p className="text-gray-600">66 Kroo Town Road</p>
                    <p className="text-gray-600">Freetown</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mt-1 mr-4 text-primary-600 p-3 rounded-full">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Phone Numbers</h3>
                    <p className="text-gray-600">Main Office: +232 79 905047</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mt-1 mr-4 text-primary-600 p-3 rounded-full">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Email Address</h3>
                    <p className="text-gray-600">General Inquiries: saloneswim@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mt-1 mr-4 text-primary-600 p-3 rounded-full">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Office Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM</p>
                    <p className="text-gray-600">Saturday: 9:00 AM - 1:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="text-red-500 mr-2" size={24} />
                    <h3 className="text-lg font-medium text-red-900">Report a Concern</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    If you need to report a sensitive issue or concern, you can submit an anonymous report. Your privacy and safety are our top priority.
                  </p>
                  <button
                    onClick={() => setShowReportForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <AlertTriangle size={16} className="mr-2" />
                    Submit Anonymous Report
                  </button>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="mb-6">Send Us a Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-96 relative">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15764.544038109437!2d-13.24959!3d8.47493!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xf04c407efe8eb49%3A0x38a69cadb3e6a381!2sNational%20Stadium%2C%20Freetown%2C%20Sierra%20Leone!5e0!3m2!1sen!2sus!4v1634567890123!5m2!1sen!2sus" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="SLSDWA Location"
        ></iframe>
      </section>

      {showReportForm && (
        <AnonymousReportForm onClose={() => setShowReportForm(false)} />
      )}
    </>
  );
};

export default ContactPage;