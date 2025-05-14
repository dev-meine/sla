import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import GalleryGrid from '../components/gallery/GalleryGrid';

const GalleryPage: React.FC = () => {
  return (
    <>
      <PageHeader
        title="Gallery"
        description="View photos from our competitions, training camps, and special events."
        image="https://i.ibb.co/P8sw9wj/20240430-165617-min.jpg"
      />
      <GalleryGrid />
    </>
  );
};

export default GalleryPage;