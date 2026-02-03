"use client"
import { motion } from "framer-motion";
import { HeartHandshake, BookOpen, GraduationCap, Users, Building2, Sparkles, ArrowRight } from "lucide-react";
import React from "react";

const WhosUsingSectionComponent: React.FC = () => {
  const users = [
    {
      title: "Students",
      description: "Master your focus with quiet study spaces and elite resources designed for academic excellence.",
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-600",
      delay: 0.1,
    },
    {
      title: "Educators",
      description: "Provide your students with the perfect environment and guidance to reach their full potential.",
      icon: BookOpen,
      color: "bg-emerald-50 text-emerald-600",
      delay: 0.2,
    },
    {
      title: "Institutions",
      description: "Partner with us to create world-class learning hubs and manage your student focus effectively.",
      icon: Building2,
      color: "bg-indigo-50 text-indigo-600",
      delay: 0.3,
    },
  ];

  const partners = [
    { name: "DTU", type: "University", color: "text-red-500", icon: null },
    { name: "E-Cell", type: "Innovation Hub", color: "bg-yellow-400", icon: "E" },
    { name: "Hackathons", type: "Tech Community", color: "bg-blue-500", icon: "H" },
    { name: "Local Library", type: "Knowledge Hub", color: "text-blue-500", icon: BookOpen },
    { name: "Student Unions", type: "Student Support", color: "text-blue-400", icon: HeartHandshake },
  ];

  return (
    <section className="relative py-24 bg-white overflow-hidden" id="about">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-emerald-50/50 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight mb-6">
              Who&apos;s using
              <span className="text-blue-600 italic"> Focus Desk?</span>
            </h2>
            <p className="text-xl text-gray-500 font-medium leading-relaxed">
              Trusted by students, educators, and institutions worldwide to create the future of learning.
            </p>
          </motion.div>
        </div>

        {/* User Content Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {users.map((user, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: user.delay }}
              className="group p-10 rounded-[3rem] bg-gray-50 hover:bg-white border border-transparent hover:border-blue-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 pointer-cursor"
            >
              <div className={`w-14 h-14 ${user.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                <user.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{user.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-6">{user.description}</p>
              <div className="flex items-center text-blue-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                Explore <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Professional Logo Cloud (Trusted By) */}
        <div className="text-center">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-gray-900 mb-16"
          >
            Trusted By
          </motion.h3>

          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
            {partners.map((partner, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group flex flex-col items-center grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-500"
              >
                <div className="mb-4 h-16 flex items-center justify-center">
                  {partner.icon === "E" ? (
                    <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-yellow-400/20 group-hover:rotate-6 transition-transform">E</div>
                  ) : partner.icon === "H" ? (
                    <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                      <div className="w-7 h-7 bg-white rounded-md" />
                    </div>
                  ) : typeof partner.icon === "function" ? (
                    <partner.icon className={`w-14 h-14 ${partner.color} group-hover:scale-110 transition-transform`} />
                  ) : (
                    <div className={`text-3xl font-black ${partner.color} tracking-tight group-hover:scale-110 transition-transform`}>{partner.name}</div>
                  )}
                </div>

                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">
                  {partner.name}
                </div>
                <div className="text-[9px] font-bold text-gray-300 mt-1 uppercase">
                  {partner.type}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default WhosUsingSectionComponent;
