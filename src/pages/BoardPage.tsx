import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type BoardMember = Database['public']['Tables']['board_members']['Row'];

const BoardPage: React.FC = () => {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBoardMembers();
  }, []);

  const fetchBoardMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('board_members')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setBoardMembers(data || []);
    } catch (error) {
      console.error('Error fetching board members:', error);
    } finally {
      setIsLoading(false);
    }
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
      <>
        <PageHeader
          title="Executive Board"
          description="Meet the leadership team guiding the Sierra Leone Swimming Federation."
          image="https://i.ibb.co/KpkYVshn/Screenshot-2025-05-14-at-2-11-58-AM-min.png"
        />
        <section className="section bg-white">
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
        title="Executive Board"
        description="Meet the leadership team guiding the Sierra Leone Swimming Federation."
        image="https://i.ibb.co/KpkYVshn/Screenshot-2025-05-14-at-2-11-58-AM-min.png"
      />

      <section className="section bg-white">
        <div className="container-custom">
          {boardMembers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No board members available.</p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
            >
              {boardMembers.map((member) => (
                <motion.div key={member.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden group hover:shadow-md transition-shadow duration-300" variants={item}>
                  <div className="relative pb-[100%] overflow-hidden">
                    <img 
                      src={member.image || "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                      alt={member.name}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl mb-1 text-slate-900">{member.name}</h3>
                    <p className="text-primary-600 font-medium mb-4">{member.position}</p>
                    <p className="text-slate-600 mb-4 text-sm leading-relaxed">{member.bio}</p>
                    <a 
                      href={`mailto:${member.position.toLowerCase().replace(' ', '')}@slsdwa.org`}
                      className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors"
                    >
                      <Mail size={16} className="mr-2" />
                      Contact
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6 text-slate-900">Our Mission</h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              The Executive Board of the Sierra Leone Swimming Federation is committed to developing aquatic sports across the country, providing opportunities for athletes of all ages and abilities, and representing Sierra Leone with excellence in international competitions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-lg font-bold text-blue-600">D</span>
                </div>
                <h3 className="text-xl mb-3 text-slate-900">Development</h3>
                <p className="text-slate-600">Creating pathways for athletes from grassroots to elite levels</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-lg font-bold text-amber-600">R</span>
                </div>
                <h3 className="text-xl mb-3 text-slate-900">Representation</h3>
                <p className="text-slate-600">Representing Sierra Leone on the global aquatics stage</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-lg font-bold text-green-600">C</span>
                </div>
                <h3 className="text-xl mb-3 text-slate-900">Community</h3>
                <p className="text-slate-600">Promoting water safety and aquatic education nationwide</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BoardPage;