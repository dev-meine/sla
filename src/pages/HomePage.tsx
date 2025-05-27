import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturedNews from '../components/home/FeaturedNews';
import FeaturedAthletes from '../components/home/FeaturedAthletes';
import ActivitiesHighlight from '../components/home/ActivitiesHighlight';
import SwimmingPackages from '../components/home/SwimmingPackages';
import ContactSection from '../components/home/ContactSection';

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <FeaturedNews />
      <FeaturedAthletes />
      <ActivitiesHighlight />
      <SwimmingPackages />
      <ContactSection />
    </>
  );
};

export default HomePage;