import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, User, Tag } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
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
      <>
        <PageHeader title="Loading Article..." />
        <section className="section bg-slate-50 min-h-[50vh]">
          <div className="container-custom">
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <PageHeader title="Article Not Found" description="The story you are looking for does not exist or has been removed." />
        <section className="section bg-slate-50 min-h-[40vh] flex items-center justify-center">
          <div className="text-center">
            <Link to="/news" className="btn btn-primary inline-flex items-center">
              <ArrowLeft size={18} className="mr-2" />
              Back to News
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={post.category || "Press Release"}
        description={formatDate(post.created_at)}
        image={post.image_url || "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1470&q=80"}
      />

      <section className="section bg-white relative">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link to="/news" className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium mb-12 transition-colors">
              <ArrowLeft size={18} className="mr-2" />
              Back to Articles
            </Link>

            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white"
            >
              <div className="mb-10 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500 mb-6 font-medium">
                  <span className="flex items-center bg-slate-100 px-3 py-1 rounded-full text-slate-700">
                    <Calendar size={16} className="mr-2" />
                    {formatDate(post.created_at)}
                  </span>
                  
                  {post.category && (
                    <span className="flex items-center bg-primary-50 px-3 py-1 rounded-full text-primary-700">
                      <Tag size={16} className="mr-2" />
                      {post.category}
                    </span>
                  )}
                  
                  {/* Defaulting author since it's typically internal SLA communications */}
                  <span className="flex items-center bg-slate-100 px-3 py-1 rounded-full text-slate-700">
                    <User size={16} className="mr-2" />
                    Sierra Leone Aquatics
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="text-xl text-gray-600 leading-relaxed font-medium">
                    {post.excerpt}
                  </p>
                )}
              </div>

              {/* Main Image Banner — Medium/LinkedIn style: max-height capped, minimal crop */}
              <div className="w-full max-h-[480px] rounded-2xl overflow-hidden mb-12 shadow-md bg-slate-100">
                 <img 
                    src={post.image_url || "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1470&q=80"}
                    alt={post.title}
                    className="w-full h-full max-h-[480px] object-cover"
                 />
              </div>

              {/* Main Content */}
              <div className="max-w-none">
                {renderArticleContent(post.content || '')}
              </div>
            </motion.article>

            <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center bg-slate-50 p-8 rounded-xl">
              <div className="mb-4 md:mb-0 text-center md:text-left">
                <h3 className="font-bold text-lg text-gray-900 mb-1">Spread the Word</h3>
                <p className="text-gray-500 text-sm">Share this article with your community</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default NewsArticlePage;
