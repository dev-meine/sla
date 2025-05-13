import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';

type GalleryItem = Database['public']['Tables']['gallery_items']['Row'];

const GalleryGrid: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      setGalleryItems(data || []);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const breakpointColumns = {
    default: 3,
    1024: 3,
    768: 2,
    640: 1
  };

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {galleryItems.map((item) => (
          <motion.div
            key={item.id}
            className="mb-4 overflow-hidden rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="group relative cursor-pointer">
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <iframe
                  src={item.url}
                  title={item.title}
                  className="w-full aspect-video"
                  allowFullScreen
                />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-end justify-start">
                <div className="p-4 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-200 text-sm">{item.description}</p>
                  )}
                  <p className="text-gray-300 text-xs mt-2">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </Masonry>

      {galleryItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No gallery items found.</p>
        </div>
      )}
    </div>
  );
};

export default GalleryGrid;