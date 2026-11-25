import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Mail, FileText, Download, ExternalLink } from 'lucide-react';
import { supabase, cachedQuery } from '../lib/supabase';
import { Database } from '../types/supabase';
import { sortBoardMembers } from '../utils/boardOrder';

type BoardMember = Database['public']['Tables']['board_members']['Row'];

const BoardPage: React.FC = () => {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBoardMembers();
  }, []);

  const fetchBoardMembers = async () => {
    try {
      const { data, error } = await cachedQuery<BoardMember[]>(
        'board-members',
        () => supabase
          .from('board_members')
          .select('*')
          .order('display_order', { ascending: true, nullsFirst: false })
          .order('name')
      );
      
      if (error) throw error;
      setBoardMembers(sortBoardMembers(data || []));
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
                      loading="lazy"
                      decoding="async"
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
                      href={`mailto:${member.position.toLowerCase().replace(/[^a-z0-9]/g, '')}@slsdwa.org`}
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

      <section className="section bg-slate-50 border-y border-slate-100">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600 mb-2">
              Governance &amp; Statutes
            </p>
            <h2 className="mb-3 text-slate-900">Official Documents</h2>
            <p className="text-slate-600 leading-relaxed">
              Review or download the governing statutes and General Assembly records of Sierra Leone Aquatics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <article className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <FileText size={22} />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    PDF · 13 Pages
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  FINA Approved Constitution
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Official statutes of the Sierra Leone Swimming, Diving and Water Polo Association (SLSDWA), covering federation governance, membership, elections, committees, and FINA/World Aquatics compliance.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                <a
                  href="/documents/fina-approved-constitution.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  <ExternalLink size={15} />
                  View PDF
                </a>
                <a
                  href="/documents/fina-approved-constitution.pdf"
                  download="FINA-Approved-Constitution.pdf"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
                >
                  <Download size={15} />
                  Download
                </a>
              </div>
            </article>

            <article className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <FileText size={22} />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    PDF · 6 Pages · Oct 2021
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  2021 Congress Minutes
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Official minutes of the Elective General Assembly held at Negus Nagas Multi-Purpose Complex, Grafton on 23 October 2021, including attendance, reports, election results, and executive appointments.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                <a
                  href="/documents/2021-congress-minutes.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  <ExternalLink size={15} />
                  View PDF
                </a>
                <a
                  href="/documents/2021-congress-minutes.pdf"
                  download="2021-Congress-Minutes.pdf"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
                >
                  <Download size={15} />
                  Download
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6 text-slate-900">Our Mission</h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              The Executive Board of the Sierra Leone Swimming Federation is committed to developing aquatic sports across the country, providing opportunities for athletes of all ages and abilities, and representing Sierra Leone with excellence in international competitions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">

                <h3 className="text-xl mb-3 text-slate-900">Development</h3>
                <p className="text-slate-600">Creating pathways for athletes from grassroots to elite levels</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">

                <h3 className="text-xl mb-3 text-slate-900">Representation</h3>
                <p className="text-slate-600">Representing Sierra Leone on the global aquatics stage</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">

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