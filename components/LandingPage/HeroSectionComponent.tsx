"use client"
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

// Define the type for card data
interface CardData {
  title: string;
  description: string;
  link?: string;
  image: string;
  className?: string;
  gradient: string;
  delay: number;
}

// Define the props type for the Card component
interface CardProps {
  card: CardData;
}

const sub_heading =
  "Secure your spot in libraries across the city, reserve amenities, and join the perfect study environment.";

const cardData: CardData[] = [
  {
    title: "Library",
    description: "Find nearby self-study centers",
    link: "#library",
    image: "/library.png",
    className: "md:col-span-2 md:row-span-1",
    gradient: "from-[#b9e2f5] to-[#7cb9f7]",
    delay: 0.1,
  },
  {
    title: "Mentorship",
    description: "Guidance from top mentors",
    link: "#mentorship",
    image: "/mentor.png",
    className: "md:col-span-1 md:row-span-2",
    gradient: "from-[#b9e2f5] to-[#7cb9f7]",
    delay: 0.2,
  },
  {
    title: "Focus Mode",
    description: "Tools for productivity",
    image: "/focus_mode.png",
    link: "/focus",
    className: "md:col-span-1 md:row-span-2",
    gradient: "from-[#b9e2f5] to-[#7cb9f7]",
    delay: 0.3,
  },
  {
    title: "Resources",
    description: "Explore study materials",
    link: "#resources",
    image: "/resources.png",
    className: "md:col-span-1 md:row-span-1",
    gradient: "from-[#b9e2f5] to-[#7cb9f7]",
    delay: 0.4,
  },
  {
    title: "Contact Us",
    description: "Get in touch",
    link: "#cta",
    image: "/tasks.png",
    className: "md:col-span-2 md:row-span-1",
    gradient: "from-[#b9e2f5] to-[#7cb9f7]",
    delay: 0.5,
  },
];

const Card: React.FC<CardProps> = ({ card }) => {
  const [imgError, setImgError] = useState<boolean>(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay: card.delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={`h-full ${card.className}`}
    >
      <Link
        href={card.link || "#"}
        className={`group relative h-full flex flex-col overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${card.gradient} transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.15)] hover:-translate-y-2 block`}
      >
        <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/40 to-transparent translate-x-[-100%] skew-x-[-15deg] group-hover:animate-shine transition-transform duration-1000" />
        </div>

        <div className="p-6 h-full flex flex-col relative z-10">
          <div className="relative z-20">
            <motion.h3
              className="text-xl lg:text-2xl font-bold text-gray-900 mb-1.5 tracking-tight leading-none"
            >
              {card.title}
            </motion.h3>
            <p className="text-xs font-semibold text-blue-900/70 leading-snug max-w-[90%]">
              {card.description}
            </p>
          </div>

          <div className="mt-4 flex items-center text-blue-950 font-bold text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
            Learn More <ArrowRight className="ml-2 w-3.5 h-3.5" />
          </div>

          <div className="absolute bottom-4 right-4 w-[40%] h-[50%] flex items-end justify-end pointer-events-none">
            {!imgError ? (
              <motion.img
                animate={{ y: [0, -6, 0], rotate: [0, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                src={card.image}
                alt={card.title}
                className="max-w-full max-h-full object-contain filter drop-shadow-[0_12px_15px_rgba(0,0,0,0.15)] group-hover:scale-110 group-hover:rotate-[-2deg] transition-all duration-700 origin-bottom-right"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-12 h-12 bg-blue-900/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-900/10">
                <span className="text-blue-900/40 font-bold text-lg">{card.title.charAt(0)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const HeroSectionComponent: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] bg-white flex items-center pt-32 pb-32 overflow-hidden">

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-50/60 rounded-full blur-[160px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-blue-50/50 rounded-full blur-[140px]"
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] opacity-[0.03] mix-blend-multiply" />
      </div>

      <div className="container mx-auto px-8 md:px-12 z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm mb-6 group cursor-default"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 mr-2 group-hover:rotate-12 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Premium Focus Ecosystem</span>
              </motion.div>

              <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-gray-900 leading-[0.95] tracking-[-0.04em]">
                Book Your
                <br />
                <motion.span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-600 to-indigo-700 bg-[length:200%_auto] animate-gradient-x"
                >
                  Space.
                </motion.span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="mt-6 text-xl text-gray-600 font-medium leading-relaxed max-w-lg"
              >
                {sub_heading}
              </motion.p>

              <div className="mt-8 flex flex-wrap gap-6">
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-10 py-5 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-black transition-all shadow-[0_20px_40px_rgba(0,0,0,0.15)] flex items-center group"
                >
                  Get Started <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                </motion.button>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-8 pt-10 border-t border-gray-100">
                {[
                  { label: "Elite Hubs", value: "50+" },
                  { label: "Learners", value: "15k+" },
                  { label: "Satisfaction", value: "4.9" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + (i * 0.1) }}
                    className="space-y-1"
                  >
                    <div className="text-3xl font-bold text-gray-900 leading-none tracking-tight">{stat.value}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:auto-rows-[140px]">
              {cardData.map((card, idx) => (
                <Card key={idx} card={card} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSectionComponent;