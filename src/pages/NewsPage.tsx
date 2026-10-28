import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { supabase, cachedQuery } from '../lib/supabase';
import { Database } from '../types/supabase';

type NewsPost = Pick<Database['public']['Tables']['news_posts']['Row'], 'id' | 'title' | 'author' | 'category' | 'excerpt' | 'image_url' | 'created_at'>;

const NewsPage: React.FC = () => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await cachedQuery(
        'all-news',
        () => supabase
          .from('news_posts')
          .select('id, title, author, category, excerpt, image_url, created_at')
          .order('created_at', { ascending: false })
      );
      
      if (error) throw error;
      setPosts((data as NewsPost[]) || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(posts.map(post => post.category).filter(Boolean))];

  // Filter posts by category
  const filteredPosts = activeCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === activeCategory);

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
      <>
        <PageHeader
          title="Latest News"
          description="Stay updated with the latest news and announcements from Sierra Leone Aquatics."
          image="https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        />
        <section className="section">
          <div className="container-custom">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Latest News"
        description="Stay updated with the latest news and announcements from Sierra Leone Aquatics."
        image="https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      />

      <section className="section bg-white">
        <div className="container-custom">
          {/* Category filters */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                  activeCategory === category
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category === 'all' ? 'All News' : category}
              </button>
            ))}
          </div>

          {/* News grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            key={activeCategory}
          >
            {filteredPosts.map((post) => (
              <motion.div key={post.id} className="bg-white rounded-2xl border border-slate-100/90 overflow-hidden group flex flex-col h-full shadow-sm hover:shadow-md transition-shadow" variants={item}>
                <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                  <img 
                    src={post.image_url || "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center text-xs text-slate-500 mb-3">
                    <Calendar size={13} className="mr-1.5 text-slate-400" />
                    <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}</span>
                    {post.category && (
                      <>
                        <span className="mx-2 text-slate-300">•</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-wider">
                          {post.category}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="text-xl font-bold font-heading mb-2.5 text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto pt-2">
                    <Link to={`/news/${post.id}`} className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-primary-600 hover:text-primary-700 transition-colors">
                      Read Story
                      <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-slate-600">No news posts found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default NewsPage;