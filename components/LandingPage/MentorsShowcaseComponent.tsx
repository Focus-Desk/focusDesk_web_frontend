"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Award, Users, Star, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Zap, Trophy, Heart } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import React from "react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// JSON data (Keep content same as original)
const mentorsData = {
  mentors: [
    {
      name: "Prachi",
      category: "UPSC CSE Mentor",
      image: "mprachi.jpg",
      qualifications: [
        "Bachelor of Management Studies (BMS), University of Delhi",
        "UPSC Foundation Course – Vision IAS",
      ],
      experience: {
        years: 3,
        type: "Work",
        specialization: ["UPSC CSE Strategy", "Planning", "Study Guidance"],
      },
      achievements: [],
    },
    {
      name: "Amit Kumar",
      category: "Government Officer / SSC CGL",
      image: "mamitkumar.jpg",
      qualifications: [
        "Bachelor of Science (B.Sc), Ramjas College, University of Delhi",
      ],
      experience: {
        years: 1.5,
        type: "",
        specialization: ["Government Service"],
      },
      achievements: [
        "One of the Youngest Tax Inspectors from the 2023 SSC CGL Batch",
      ],
    },
    {
      name: "Anjali Gupta",
      category: "UPSC CSE Mentor",
      image: "manjali.jpg",
      qualifications: [
        "UGC-NET Qualified",
        "CDS Qualified (3 Times)",
        "Master's in Political Science and International Relations, University of Delhi",
      ],
      experience: {
        years: 5,
        type: "Teaching and Mentorship",
        specialization: ["Teaching", "UPSC CSE Preparation Mentorship"],
      },
      achievements: ["UGC-NET Qualified", "CDS Qualified (3 Times)"],
    },
    {
      name: "CA Himanshu Thakur",
      category: "Chartered Accountant",
      image: "mcahimanshuthakur.jpg",
      qualifications: [
        "B.Com (Hons), University of Delhi",
        "Chartered Accountant (CA)",
      ],
      experience: {
        years: 2,
        type: "Mentorship",
        specialization: [
          "Articleship at Top 10 CA Firm",
          "Big 4 Accounting Firm Experience",
        ],
      },
      achievements: [
        "All India Rank Holder – CA Foundation",
        "First Distinction Holder – B.Com (Hons), DU",
      ],
    },
  ],
};

const MentorCard = ({ mentor, theme }: { mentor: any; theme: any }) => {
  return (
    <Card
      className={`relative group ${theme.bg} border-0 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(30,58,138,0.2)] h-[36rem] flex flex-col`}
    >
      <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <CardHeader className="text-center pb-6 pt-12 relative">
        <div className="relative inline-block mx-auto mb-6">
          <div className="absolute inset-0 bg-white rounded-full blur-2xl opacity-40 animate-pulse-slow" />
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <img
              src={`/${mentor.image}`}
              alt={mentor.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-xl transition-all duration-700"
            />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
          </motion.div>
        </div>

        <CardTitle className="text-gray-900 text-2xl font-black tracking-tight mb-2">
          {mentor.name}
        </CardTitle>
        <CardDescription className="text-xs font-black uppercase tracking-[0.2em] text-slate-900/60">
          {mentor.category}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col px-8 pb-10 relative z-10">
        <div className="space-y-6 flex-1">
          <div className="flex items-center gap-3 p-3 bg-white/40 rounded-2xl border border-white/40 group-hover:bg-white/60 transition-colors">
            <Users className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-bold text-slate-800">
              {mentor.experience.years}+ Years {mentor.experience.type || 'Experience'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900/40">
              <GraduationCap className="w-3 h-3" /> Background
            </div>
            {mentor.qualifications.slice(0, 2).map((q: string, i: number) => (
              <p key={i} className="text-sm font-medium text-slate-800 leading-snug line-clamp-2 italic">
                &ldquo;{q}&rdquo;
              </p>
            ))}
          </div>

          {mentor.achievements.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900/40">
                <Award className="w-3 h-3" /> Key Accomplishment
              </div>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                {mentor.achievements[0]}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-black/5">
          {mentor.experience.specialization.slice(0, 2).map((spec: string, i: number) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-white/40 border border-white/40 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-800 group-hover:bg-white/80 transition-all"
            >
              {spec}
            </span>
          ))}
          {mentor.experience.specialization.length > 2 && (
            <span className="px-3 py-1.5 bg-white/20 rounded-lg text-[9px] font-black uppercase text-slate-600">
              +{mentor.experience.specialization.length - 2}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function MentorsShowcaseComponent() {
  const getVibrantTheme = (category: string) => {
    if (category.includes("CA") || category.includes("Chartered Accountant")) {
      return {
        bg: "bg-gradient-to-br from-cyan-400 to-cyan-50",
        gradient: "from-cyan-400 to-emerald-400"
      };
    }
    return {
      bg: "bg-gradient-to-br from-sky-400 to-sky-100",
      gradient: "from-blue-600 to-indigo-600"
    };
  };

  return (
    <section className="relative py-32 bg-white px-6 md:px-12 scroll-m-20 overflow-hidden" id="mentorship">
      <div className="absolute top-1/2 left-0 w-1/3 h-1/3 bg-blue-50/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-indigo-50/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
              <Award className="w-4 h-4 text-indigo-600 mr-2" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/80">Expert Guidance</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-[1000] text-gray-900 leading-tight tracking-tight mb-8">
              Meet Our
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic"> Expert Mentors</span>
            </h2>

            <p className="text-xl text-gray-500 font-medium leading-relaxed">
              Learn straight from industry veterans and toppers who have navigated the path to success.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={32}
            slidesPerView={1}
            navigation={{
              nextEl: '.mentor-next',
              prevEl: '.mentor-prev',
            }}
            pagination={{ clickable: true, el: '.mentor-pagination' }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="mentors-swiper !pb-20"
          >
            {mentorsData.mentors.map((mentor, idx) => (
              <SwiperSlide key={idx}>
                <MentorCard mentor={mentor} theme={getVibrantTheme(mentor.category)} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 z-30">
            <button className="mentor-prev w-14 h-14 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all shadow-sm hover:shadow-xl disabled:opacity-30">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="mentor-pagination flex gap-2 !static !w-auto" />
            <button className="mentor-next w-14 h-14 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all shadow-sm hover:shadow-xl disabled:opacity-30">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* FINAL POLISHED STATS SECTION - ELITE, BALANCED, CINEMATIC */}
        <div className="mt-64 relative">
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-blue-50 border border-blue-100/50 mb-8 group cursor-default">
                <ShieldCheck className="w-4 h-4 text-blue-600 mr-2.5 group-hover:rotate-12 transition-transform duration-500" />
                <span className="text-[10px] font-[1000] uppercase tracking-[0.4em] text-blue-600/80">The Advantage</span>
              </div>
              <h3 className="text-5xl md:text-6xl font-[1000] text-gray-900 tracking-[-0.03em] leading-[1.1]">
                Empowering Your <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] animate-gradient-slow italic">Success Story.</span>
              </h3>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { label: "Combined Experience", value: "15+", suffix: "Years", icon: Zap, color: "bg-amber-400", light: "bg-amber-50", text: "text-amber-600" },
              { label: "Students Mentored", value: "100+", suffix: "Learners", icon: Trophy, color: "bg-blue-600", light: "bg-blue-50", text: "text-blue-600" },
              { label: "Expert Domains", value: "4+", suffix: "Categories", icon: Heart, color: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600" },
              { label: "Success Rate", value: "95%", suffix: "Rating", icon: Star, color: "bg-rose-500", light: "bg-rose-50", text: "text-rose-600" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative p-8 bg-white hover:bg-gray-50/50 rounded-[3rem] border border-gray-100/80 hover:border-blue-200/50 transition-all duration-500 hover:shadow-[0_50px_100px_-30px_rgba(0,0,0,0.08)]"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-8 w-14 h-14 rounded-[1.25rem] ${stat.color} flex items-center justify-center text-white shadow-xl shadow-opacity-20 transform-gpu group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <stat.icon className="w-7 h-7" />
                  </div>

                  <div className="space-y-1 mt-auto">
                    <div className="text-5xl font-[1000] text-gray-900 tracking-tighter group-hover:scale-105 transition-transform duration-500">
                      {stat.value}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mt-2">
                      {stat.label}
                    </div>
                    <div className={`text-[9.5px] font-black uppercase tracking-widest ${stat.text} opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0`}>
                      {stat.suffix}
                    </div>
                  </div>
                </div>

                {/* Glass Inner Glow */}
                <div className="absolute inset-x-4 top-4 bottom-4 border border-white opacity-0 group-hover:opacity-40 transition-opacity rounded-[2.5rem] pointer-events-none" />
              </motion.div>
            ))}
          </div>

          {/* Cinematic Multi-layered Mesh */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[120%] h-[120%] pointer-events-none -z-10">
            <motion.div
              animate={{ x: [-20, 20, -20], y: [-20, 20, -20] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[10%] left-[15%] w-96 h-96 bg-blue-100/30 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{ x: [20, -20, 20], y: [20, -20, 20] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[20%] right-[15%] w-[30rem] h-[30rem] bg-indigo-50/40 rounded-full blur-[120px]"
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-50/50 rounded-full blur-[80px]" />
          </div>
        </div>

      </div>

      <style jsx global>{`
        .mentor-pagination .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #e2e8f0;
          opacity: 1;
          transition: all 0.3s ease;
        }
        .mentor-pagination .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 4px;
          background: #1e3a8a;
        }
      `}</style>
    </section>
  );
}
