import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';

type NewsPost = Database['public']['Tables']['news_posts']['Row'];

const FeaturedNews: React.FC = () => {
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNewsPosts();
  }, []);

  const fetchNewsPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('news_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      setNewsPosts(data || []);
    } catch (error) {
      console.error('Error fetching news posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="mb-4">Latest News</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest news, events, and achievements from the Sierra Leone Federation.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {newsPosts.map((post) => (
            <motion.div key={post.id} className="card" variants={item}>
              <div className="h-48 overflow-hidden">
                <img 
                  src={post.image_url || "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar size={14} className="mr-1" />
                  <span>{formatDate(post.created_at)}</span>
                  {post.category && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{post.category}</span>
                    </>
                  )}
                </div>
                <h3 className="text-xl mb-3">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <Link to={`/news/${post.id}`} className="inline-flex items-center font-medium text-primary-600 hover:text-primary-700">
                  Read More
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {newsPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No news posts available.</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/news" className="btn btn-outline">
            View All News
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedNews;