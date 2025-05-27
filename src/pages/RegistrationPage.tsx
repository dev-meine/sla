import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import SwimmingRegistration from '../components/registration/SwimmingRegistration';

const RegistrationPage: React.FC = () => {
  return (
    <>
      <PageHeader
        title="Swimming Lessons Registration"
        description="Join our swimming programs and learn from experienced instructors."
        image="https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      />
      <section className="section">
        <div className="container-custom">
          <SwimmingRegistration />
        </div>
      </section>
    </>
  );
};

export default RegistrationPage;