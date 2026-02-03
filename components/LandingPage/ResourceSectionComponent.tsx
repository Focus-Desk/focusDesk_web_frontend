"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { FileText, BookOpen, Cpu, ClipboardList, Star, ArrowRight, ArrowLeft, Download, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Layers } from "lucide-react"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { motion, AnimatePresence } from "framer-motion"
import React from "react"

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// Masterpiece Resources data array
const resourcesData = [
  {
    id: 1,
    title: "Chartered Accountant",
    category: "Professional / ICAI",
    icon: FileText,
    downloads: "2.5k+",
    status: "Verified",
    theme: "blue",
    accent: "text-blue-500",
    gradient: "from-blue-500 via-indigo-600 to-blue-700",
    glow: "bg-blue-400/20",
    resources: [
      "ICAI Module PDFs & Practice Manuals",
      "RTPs, MTPs, Suggested Answers",
      "Amendments Summary PDFs"
    ]
  },
  {
    id: 2,
    title: "UPSC CSE",
    category: "Civil Services / IAS",
    icon: BookOpen,
    downloads: "4.8k+",
    status: "Trending",
    theme: "emerald",
    accent: "text-emerald-500",
    gradient: "from-emerald-500 via-teal-600 to-emerald-700",
    glow: "bg-emerald-400/20",
    resources: [
      "Daily Current Affairs (PIB Summary)",
      "Monthly Compilations (Vision IAS)",
      "Topper's Answer Copies"
    ]
  },
  {
    id: 3,
    title: "JEE / NEET",
    category: "Entrance / Engineering",
    icon: Cpu,
    downloads: "3.2k+",
    status: "Updated",
    theme: "indigo",
    accent: "text-indigo-500",
    gradient: "from-indigo-500 via-violet-600 to-indigo-700",
    glow: "bg-indigo-400/20",
    resources: [
      "30/60/90 Day Revision Plans",
      "Top Coaching Free Resources",
      "Concept Flashcards & Maps"
    ]
  },
  {
    id: 4,
    title: "SSC / CGL",
    category: "Govt Jobs / Railway",
    icon: ClipboardList,
    downloads: "1.9k+",
    status: "New",
    theme: "amber",
    accent: "text-amber-500",
    gradient: "from-amber-500 via-orange-600 to-amber-700",
    glow: "bg-amber-400/20",
    resources: [
      "Tier-wise Complete Syllabus",
      "Daily Practice Questions (DPP)",
      "Vocabulary & Idioms PDFs"
    ]
  }
]

export default function ResourcesSectionComponent() {
  return (
    <section className="relative py-48 bg-white px-6 md:px-12 scroll-m-20 overflow-hidden" id="resources">
      {/* Elite Background Atmosphere - Multiple Layers */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <motion.div
          animate={{ x: [-100, 100, -100], y: [-50, 50, -50], rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[10%] w-[60%] h-[60%] bg-blue-50/20 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{ x: [100, -100, 100], y: [50, -50, 50], rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[10%] w-[60%] h-[60%] bg-indigo-50/20 rounded-full blur-[140px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="container mx-auto relative z-10">

        {/* Masterpiece Header Design */}
        <div className="text-center max-w-4xl mx-auto mb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/60 backdrop-blur-md border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-12 group">
              <Sparkles className="w-5 h-5 text-blue-500 mr-3 animate-pulse" />
              <span className="text-[11px] font-[1000] uppercase tracking-[0.4em] text-blue-600/70">Elite Knowledge Base</span>
            </div>

            <h2 className="text-6xl md:text-8xl font-[1000] text-gray-900 tracking-[-0.04em] leading-[0.95] mb-12">
              The Digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 italic">Success Library.</span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Curated by toppers, verified by experts—your ultimate toolkit for professional excellence.
            </p>
          </motion.div>
        </div>

        {/* Masterpiece Carousel HUD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="relative"
        >
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={32}
            slidesPerView={1}
            navigation={{
              nextEl: '.res-nav-next',
              prevEl: '.res-nav-prev',
            }}
            pagination={{ clickable: true, el: '.res-pagination-hud' }}
            autoplay={{ delay: 7000, disableOnInteraction: false }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1100: { slidesPerView: 3 },
              1600: { slidesPerView: 4 },
            }}
            className="res-master-swiper !pb-32 !px-4"
          >
            {resourcesData.map((resource, idx) => (
              <SwiperSlide key={resource.id} className="h-auto">
                <Card className="group relative h-[42rem] border-0 rounded-[4rem] bg-white/40 backdrop-blur-2xl hover:bg-white transition-all duration-700 hover:shadow-[0_80px_120px_-40px_rgba(30,58,138,0.15)] flex flex-col overflow-hidden ring-1 ring-gray-100/50 hover:ring-blue-100">

                  {/* Category Accent Pod */}
                  <div className={`absolute top-0 right-0 w-40 h-40 ${resource.glow} rounded-full blur-[70px] opacity-40 group-hover:opacity-100 transition-opacity duration-700`} />

                  {/* Shimmer Light Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                  <CardHeader className="p-12 pb-0 relative z-10">
                    <div className="flex justify-between items-start mb-10">
                      <motion.div
                        whileHover={{ y: -5, rotate: 10 }}
                        className={`w-18 h-18 rounded-[2rem] bg-gradient-to-br ${resource.gradient} flex items-center justify-center text-white shadow-2xl shadow-indigo-200 transition-all duration-500`}
                      >
                        <resource.icon className="w-9 h-9" />
                      </motion.div>
                      <div className="flex flex-col items-end pt-2">
                        <div className={`px-4 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm text-[10px] font-black tracking-widest ${resource.accent} uppercase group-hover:scale-110 transition-transform duration-500`}>
                          {resource.status}
                        </div>
                        <span className="text-[11px] font-black text-gray-400 mt-3 tracking-widest uppercase">{resource.downloads} <span className="text-[9px] text-gray-300">Assets</span></span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
                        {resource.category}
                      </span>
                      <CardTitle className="text-4xl font-[1000] text-gray-900 tracking-[-0.04em] leading-tight group-hover:text-blue-600 transition-colors duration-500">
                        {resource.title}
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="p-12 pt-8 flex-grow relative z-10 flex flex-col">
                    <div className="space-y-6 flex-grow">
                      {resource.resources.map((item, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ x: 10 }}
                          className="flex items-center space-x-5 group/item cursor-pointer"
                        >
                          <div className={`w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center group-hover/item:bg-white border border-transparent group-hover/item:border-gray-100 transition-all duration-300 shadow-sm`}>
                            <TrendingUp className={`w-4.5 h-4.5 ${resource.accent} opacity-30 group-hover/item:opacity-100 transition-opacity`} />
                          </div>
                          <span className="text-gray-500 group-hover/item:text-gray-900 font-black text-[13px] leading-tight tracking-tight transition-colors">
                            {item}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Elite Action Button */}
                    <div className="mt-12 relative group/btn">
                      <div className={`absolute inset-0 bg-gradient-to-r ${resource.gradient} blur-2xl opacity-0 group-hover/btn:opacity-20 transition-opacity duration-500 rounded-3xl`} />
                      <button className="w-full relative py-6 rounded-[2.2rem] bg-gray-900 text-white font-black text-xs tracking-[0.3em] uppercase flex items-center justify-center hover:bg-blue-600 transition-all duration-500 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] hover:scale-[1.02] transform-gpu">
                        Open Repository <ArrowRight className="ml-3 w-5 h-5 group-hover/btn:translate-x-2 transition-transform duration-500" />
                      </button>
                    </div>
                  </CardContent>

                  {/* High-End Decorative Layers */}
                  <div className="absolute inset-x-8 top-8 bottom-8 border border-gray-100/50 rounded-[3.5rem] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Masterpiece HUD Controls */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-14 z-30">
            <button className="res-nav-prev w-20 h-20 rounded-[2.5rem] border border-gray-100 bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] group transform-gpu active:scale-95">
              <ArrowLeft className="w-8 h-8 group-hover:-translate-x-2 transition-transform duration-500" />
            </button>
            <div className="res-pagination-hud flex gap-4 !static !w-auto" />
            <button className="res-nav-next w-20 h-20 rounded-[2.5rem] border border-gray-100 bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] group transform-gpu active:scale-95">
              <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform duration-500" />
            </button>
          </div>
        </motion.div>

        {/* Masterpiece Social Proof Line */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-48 flex flex-col items-center"
        >
          <div className="flex items-center space-x-4 mb-8">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-2xl group cursor-pointer hover:scale-110 transition-transform duration-300 border-opacity-80" />)}
              <div className="w-12 h-12 rounded-full border-4 border-white bg-blue-600 flex items-center justify-center text-xs font-black text-white shadow-2xl group hover:scale-110 transition-transform duration-300">+12k</div>
            </div>
          </div>
          <p className="text-[12px] font-[1000] text-gray-400 uppercase tracking-[0.5em] text-center">
            Trusted by <span className="text-gray-900 font-black">12,482</span> Rising Professionals
          </p>
        </motion.div>

      </div>

      <style jsx global>{`
        .res-pagination-hud .swiper-pagination-bullet {
          width: 14px;
          height: 14px;
          background: #e5e7eb;
          opacity: 1;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .res-pagination-hud .swiper-pagination-bullet-active {
          width: 54px;
          border-radius: 8px;
          background: #3b82f6;
          box-shadow: 0 10px 30px -5px rgba(59,130,246,0.5);
        }
      `}</style>
    </section>
  )
}
