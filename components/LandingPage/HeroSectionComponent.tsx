import { motion } from "framer-motion";
import Link from "next/link";
import React, { useState } from "react";

// Define the type for card data
interface CardData {
  title: string;
  description: string;
  link?: string;
  image: string;
  // Added className for individual grid sizing (Bento style)
  className?: string;
  // Added gradient for specific card styling
  gradient: string;
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
    // Spans 2 columns (Wide)
    className: "col-span-1 md:col-span-2",
    gradient: "bg-gradient-to-br from-cyan-400 to-blue-600",
  },
  {
    title: "Mentorship",
    description: "Guidance from top mentors",
    link: "#mentorship",
    image: "/mentor.png",
    // Spans 1 col but 2 rows (Tall)
    className: "col-span-1 row-span-2 ",
    gradient: "bg-gradient-to-br from-sky-400 to-indigo-600",
  },
  {
    title: "Focus Mode",
    description: "Tools for productivity",
    image: "/focus_mode.png",
    link: "/focus",
    className: "col-span-1 row-span-2",
    gradient: "bg-gradient-to-br from-cyan-300 to-blue-500",
  },
  {
    title: "Resources",
    description: "Explore study materials",
    link: "#resources",
    image: "/resources.png",
    // Spans 2 columns
    className: "col-span-1  row-span-1",
    gradient: "bg-gradient-to-br from-blue-400 to-cyan-600",
  },
  {
    title: "Contact Us",
    description: "Get in touch",
    link: "#cta",
    image: "/tasks.png",
    className: "col-span-2 row-span-1",
    gradient: "bg-gradient-to-br from-sky-500 to-blue-700",
  },
];

const Card: React.FC<CardProps> = ({ card }) => {
  const [imgError, setImgError] = useState<boolean>(false);

  return (
    <Link
      href={card.link || "#"}
      className={`relative group overflow-hidden rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${card.gradient} ${card.className || "col-span-1"}`}
    >
      <div className="p-6 h-full flex flex-col justify-between min-h-[160px] relative z-10">
        {/* Text Content */}
        <div className="flex-1 max-w-[70%]">
          <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-sm">{card.title}</h3>
          {card.description && (
            <p className="text-sm font-medium text-white/90 leading-snug">
              {card.description}
            </p>
          )}
        </div>

        {/* Image Container - Positioned absolutely in bottom right for Bento feel */}
        <div className="absolute -bottom-9 -right-4 w-32 h-32 md:w-40 md:h-40 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
          {!imgError ? (
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-full object-contain drop-shadow-md "
              onError={() => setImgError(true)}
            />
          ) : (
            // Fallback if image fails
            <div className="w-full h-full flex items-end justify-end p-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                <span className="text-white font-bold text-xl">{card.title.charAt(0)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

const HeroSectionComponent: React.FC = () => {
  return (
    <div className=" bg-gray-50 px-4 md:px-10 my-20 flex items-center justify-center ">
      <div className="container mx-auto py-12 max-w-7xl">

        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* Left Side: Text Content (Takes up 4 columns on large screens) */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
                  Book Your
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600">
                    Space
                  </span>
                </h1>

                <p className="text-lg text-gray-600 leading-relaxed max-w-md">
                  {sub_heading}
                </p>

                {/* Optional CTA Button */}
                <button className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors shadow-lg">
                  Get Started
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Bento Grid (Takes up 7 columns on large screens) */}
          <div className="lg:col-span-7">
            {/* Grid System: 2 cols on mobile, 3 cols on medium/large */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[180px]">
                {cardData.map((card, idx) => (
                  <Card key={idx} card={card} />
                ))}
              </div>
            </motion.div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default HeroSectionComponent;