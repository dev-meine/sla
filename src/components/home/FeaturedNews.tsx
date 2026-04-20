import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  if (isLoading) {
    return (
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-white to-slate-50 border-t border-slate-100 relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div 
          className="flex flex-col md:flex-row md:items-end justify-between mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-block px-3 py-1 bg-secondary-100 text-secondary-800 rounded-full font-sans tracking-widest text-xs uppercase font-bold mb-4 shadow-sm"
            >
              Press & Media
            </motion.span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 relative inline-block">
              Latest News
              <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary-500 rounded-full"></span>
            </h2>
          </div>
          
          <Link 
            to="/news" 
            className="group mt-8 md:mt-0 hidden md:inline-flex items-center px-6 py-3 bg-white text-primary-700 font-sans font-bold shadow-sm hover:shadow-md rounded-full transition-all uppercase tracking-wider text-sm ring-1 ring-slate-200"
          >
            All Articles
            <motion.span 
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <ArrowRight size={16} className="ml-2 text-primary-500" />
            </motion.span>
          </Link>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {newsPosts.map((post, index) => {
            const isFeatured = index === 0;
            return (
              <motion.article 
                key={post.id} 
                className={`group cursor-pointer ${isFeatured ? 'md:col-span-12 lg:col-span-7' : 'md:col-span-6 lg:col-span-5 flex flex-col justify-between'}`}
                variants={item}
              >
                <Link to={`/news/${post.id}`} className="block h-full">
                  <motion.div 
                    className={`overflow-hidden bg-slate-200 mb-6 rounded-2xl relative shadow-md group-hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] transition-shadow duration-500 ring-1 ring-white/50 ${isFeatured ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}
                    whileHover={{ y: -8, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <img 
                      src={post.image_url || "https://images.unsplash.com/photo-1519315901367-f34ff9154487?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"}
                      alt={post.title}
                      className="w-full h-full object-cover filter saturate-110 contrast-110 transition-transform duration-[1.5s] transform group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1519315901367-f34ff9154487?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 via-primary-900/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </motion.div>
                  
                  <div className="flex flex-col flex-grow px-2">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-sans text-[10px] tracking-widest uppercase text-primary-700 bg-white border border-primary-100 shadow-sm px-3 py-1 rounded-full font-bold">
                        {post.category || "General"}
                      </span>
                      <span className="font-sans text-xs tracking-widest uppercase text-slate-400 font-bold flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>
                        {formatDate(post.created_at)}
                      </span>
                    </div>

                    <h3 className={`font-heading font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors ${isFeatured ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
                      {post.title}
                    </h3>
                    
                    <p className="font-sans text-slate-600 mb-6 line-clamp-3 font-medium text-sm md:text-base">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto">
                      <span className="inline-flex items-center text-primary-600 font-bold uppercase tracking-widest text-xs">
                        Read Story
                        <motion.span
                          initial={{ x: 0, y: 0 }}
                          whileHover={{ x: 3, y: -3 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <ArrowUpRight size={16} className="ml-1" />
                        </motion.span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </motion.div>

        {newsPosts.length === 0 && (
          <div className="text-center py-20 border-t border-slate-200 mt-12">
            <p className="font-sans text-slate-500 font-medium">No press releases currently available.</p>
          </div>
        )}

        <div className="mt-12 md:hidden">
          <Link 
            to="/news" 
            className="w-full flex justify-center items-center bg-white text-primary-700 font-sans font-bold shadow-sm rounded-full transition-all uppercase tracking-wider text-sm ring-1 ring-slate-200 py-4"
          >
            All Articles
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedNews;