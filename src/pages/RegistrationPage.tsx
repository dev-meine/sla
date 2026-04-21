import React, { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import SwimmingRegistration from '../components/registration/SwimmingRegistration';
import RegistrationStatusChecker from '../components/registration/RegistrationStatusChecker';

const RegistrationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'status'>('register');

  return (
    <>
      <PageHeader
        title="Swimming Lessons"
        description="Register for our swimming programs or check your registration status."
        image="https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      />
      <section className="section bg-white">
        <div className="container-custom">
          {/* Tab Navigation */}
          <div className="mb-12">
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-full max-w-md mx-auto">
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                New Registration
              </button>
              <button
                onClick={() => setActiveTab('status')}
                className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'status'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Check Status
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'register' ? (
            <SwimmingRegistration />
          ) : (
            <RegistrationStatusChecker />
          )}
        </div>
      </section>
    </>
  );
};

export default RegistrationPage;