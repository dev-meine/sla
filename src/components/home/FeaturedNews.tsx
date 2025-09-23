import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Tag } from 'lucide-react';
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
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-40">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-blue-300 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-blue-50/50">
      {/* Enhanced decorative elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-30 blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-20 -left-20 w-80 h-80 bg-blue-300 rounded-full opacity-20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-10 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Subtle wave pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3NjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjZjFmNWY5IiBkPSJNMCAwaDEyMDB2NjAwSDB6Ii8+PHBhdGggZD0iTTEyMDAgMEgwdjYwMGgxMjAwVjB6IiBmaWxsPSIjZjFmNWY5Ii8+PHBhdGggZD0iTTAgNDgwTDI0IDQ2OC4zQzQ4IDQ1Ni43IDk2IDQzMy4zIDE0NCA0MzMuM0MxOTIgNDMzLjMgMjQwIDQ1Ni43IDI4OCA0NjhDMzM2IDQ3OS4zIDM4NCA0NzkuMyA0MzIgNDU2QzQ4MCA0MzIuNyA1MjggMzg2IDU3NiAzNjIuN0M2MjQgMzM5LjMgNjcyIDMzOS4zIDcyMCAzNjIuN0M3NjggMzg2IDgxNiA0MzIuNyA4NjQgNDQ0QzkxMiA0NTUuMyA5NjAgNDMyLjcgMTAwOCA0MjEuM0MxMDU2IDQxMCAxMTA0IDQxMCAxMTUyIDQyMS4zQzEyMDAgNDMyLjcgMTI0OCA0NTUuMyAxMjk2IDQ1NkMxMzQ0IDQ1Ni43IDEzOTIgNDM1LjcgMTQxNiA0MjQuM0wxNDQwIDQxM1Y2MDBIMFYzNjB6IiBmaWxsPSIjZjFmNWY5IiBmaWxsLW9wYWNpdHk9Ii4zIi8+PHBhdGggZD0iTTAgNTQwTDI0IDUyOC4zQzQ4IDUxNi43IDk2IDQ5My4zIDE0NCA0OTMuM0MxOTIgNDkzLjMgMjQwIDUxNi43IDI4OCA1MjhDMzM2IDUzOS4zIDM4NCA1MzkuMyA0MzIgNTE2QzQ4MCA0OTIuNyA1MjggNDQ2IDU3NiA0MjIuN0M2MjQgMzk5LjMgNjcyIDM5OS4zIDcyMCA0MjIuN0M3NjggNDQ2IDgxNiA0OTIuNyA4NjQgNTA0QzkxMiA1MTUuMyA5NjAgNDkyLjcgMTAwOCA0ODEuM0MxMDU2IDQ3MCAxMTA0IDQ3MCAxMTUyIDQ4MS4zQzEyMDAgNDkyLjcgMTI0OCA1MTUuMyAxMjk2IDUxNkMxMzQ0IDUxNi43IDEzOTIgNDk1LjcgMTQxNiA0ODQuM0wxNDQwIDQ3M1Y2MDBIMFYzNjB6IiBmaWxsPSIjZjFmNWY5IiBmaWxsLW9wYWNpdHk9Ii4yIi8+PC9nPjwvc3ZnPg==')] opacity-5"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="flex flex-col items-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.span 
            className="px-4 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full text-sm font-medium tracking-wider mb-4 shadow-sm"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            LATEST UPDATES
          </motion.span>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            News & <span className="text-blue-600 relative inline-block">
              Events
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></span>
            </span>
          </motion.h2>
          
          
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {newsPosts.map((post) => (
            <motion.div 
              key={post.id} 
              className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group border border-blue-50"
              variants={item}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <div className="relative h-56 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-blue-900/40 to-transparent z-10"></div>
                <img 
                  src={post.image_url || "https://images.unsplash.com/photo-1519315901367-f34ff9154487?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1519315901367-f34ff9154487?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
                  }}
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-medium rounded-full shadow-md shadow-blue-500/20">
                    {post.category || "Swimming"}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1 text-blue-500" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  {post.category && (
                    <div className="flex items-center">
                      <Tag size={14} className="mr-1 text-blue-500" />
                      <span>{post.category}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">{post.title}</h3>
                <p className="text-gray-600 mb-5 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                <Link 
                  to={`/news/${post.id}`} 
                  className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors group/link"
                >
                  <span className="mr-2">Read More</span>
                  <motion.span 
                    className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <ArrowRight size={14} />
                  </motion.span>
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

        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link 
            to="/news" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-full hover:from-blue-700 hover:to-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 group"
          >
            <span>View All News</span>
            <motion.span 
              className="ml-2 inline-block"
              initial={{ x: 0 }}
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ArrowRight size={16} />
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedNews;