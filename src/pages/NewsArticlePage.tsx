import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type NewsPost = Database['public']['Tables']['news_posts']['Row'];

const NewsArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost(id);
    }
  }, [id]);

  const fetchPost = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('news_posts')
        .select('*')
        .eq('id', postId)
        .single();
      
      if (error) throw error;
      setPost(data || null);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderArticleContent = (content: string) => {
    if (!content) {
      return <p className="text-slate-500 italic">Content unavailable for this article.</p>;
    }

    // If content contains rich HTML tags, render via dangerouslySetInnerHTML
    const hasHtml = /<[a-z][\s\S]*>/i.test(content);
    if (hasHtml) {
      return <div className="article-content" dangerouslySetInnerHTML={{ __html: content }} />;
    }

    // Normalize Windows and Mac line endings (\r\n -> \n, \r -> \n)
    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

    // Check if author used double line breaks (blank lines between paragraphs)
    // or single line breaks (Enter pressed once per paragraph)
    const hasDoubleNewlines = /\n\s*\n/.test(normalized);
    const rawParagraphs = hasDoubleNewlines
      ? normalized.split(/\n\s*\n+/)
      : normalized.split(/\n+/);

    const paragraphs = rawParagraphs.map(p => p.trim()).filter(Boolean);

    return (
      <div className="article-content">
        {paragraphs.map((para, pIdx) => {
          const lines = para.split('\n');
          return (
            <p key={pIdx}>
              {lines.map((line, lIdx) => (
                <React.Fragment key={lIdx}>
                  {line}
                  {lIdx < lines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          );
        })}
      </div>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] pt-12 pb-20 flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[50vh] pt-12 pb-20 flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-heading font-bold text-slate-900 mb-3">Article Not Found</h1>
          <p className="text-slate-600 mb-6">The story you are looking for does not exist or has been removed.</p>
          <Link to="/news" className="btn btn-primary inline-flex items-center">
            <ArrowLeft size={18} className="mr-2" />
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="pt-10 md:pt-14 pb-20 bg-white min-h-screen">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            to="/news" 
            className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-primary-600 mb-6 transition-colors group"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to All News
          </Link>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-500 mb-4 font-medium">
              {post.category && (
                <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full font-bold text-xs uppercase tracking-wider">
                  {post.category}
                </span>
              )}
              <span className="flex items-center bg-slate-100 px-3 py-1 rounded-full text-slate-600 text-xs">
                <Calendar size={13} className="mr-1.5 text-slate-400" />
                {formatDate(post.created_at)}
              </span>
              <span className="flex items-center bg-slate-100 px-3 py-1 rounded-full text-slate-600 text-xs">
                <User size={13} className="mr-1.5 text-slate-400" />
                Sierra Leone Aquatics
              </span>
            </div>

            {/* Article Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-slate-900 leading-[1.2] tracking-tight mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-normal mb-8 border-l-4 border-primary-500 pl-4 py-1 italic bg-slate-50 rounded-r-lg">
                {post.excerpt}
              </p>
            )}

            {/* Featured Image */}
            {post.image_url && (
              <div className="w-full max-h-[480px] rounded-2xl overflow-hidden mb-10 shadow-sm bg-slate-100 border border-slate-200/60">
                <img 
                  src={post.image_url} 
                  alt={post.title}
                  className="w-full h-full max-h-[480px] object-cover"
                />
              </div>
            )}

            {/* Main Content */}
            <div className="max-w-none">
              {renderArticleContent(post.content || '')}
            </div>

          </motion.div>
        </div>
      </div>
    </article>
  );
};

export default NewsArticlePage;
