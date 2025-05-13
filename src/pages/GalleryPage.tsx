import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import GalleryGrid from '../components/gallery/GalleryGrid';

const GalleryPage: React.FC = () => {
  return (
    <>
      <PageHeader
        title="Gallery"
        description="View photos from our competitions, training camps, and special events."
        image="https://images.pexels.com/photos/73760/swimming-swimmer-female-race-73760.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      />
      <GalleryGrid />
    </>
  );
};

export default GalleryPage;