import Link from "next/link";
import React, { useState } from "react";

// Define the type for card data
interface CardData {
  title: string;
  description: string;
  link?: string;
  image: string;
}

// Define the props type for the Card component
interface CardProps {
  card: CardData;
  color: string;
}

const sub_heading =
  "Secure your spot in library across the city, reserve amenities, and join the perfect study environment.";

const cardData: CardData[] = [
  {
    title: "Library",
    description: "find near by self study centers",
    link: "#library",
    image: "/library.png",
  },
  {
    title: "Mentorship",
    description: "Guidance from top mentor & Educator",
    link: "#mentorship",
    image: "/mentor.png",
  },
  {
    title: "Focus Mode",
    description: "Tools for productive study",
    image: "/focus_mode.png",
  },
  {
    title: "Resources",
    description: "Explore study materia",
    link: "#resources",
    image: "/resources.png",
  },
  {
    title: "Tasks",
    description: "Track your progress",
    image: "/tasks.png",
  },
  {
    title: "More",
    description: "",
    link: "#plans",
    image: "/more.png",
  },
];

const cardColors: string[] = [
  "bg-green-300",
  "bg-orange-300",
  "bg-yellow-300",
  "bg-purple-300",
  "bg-blue-300",
  "bg-pink-300",
];

const Card: React.FC<CardProps> = ({ card, color }) => {
  const [imgError, setImgError] = useState<boolean>(false);

  return (
    <Link href={card.link || "#"} className="relative">
      <div
        className={`${color} rounded-2xl p-5 flex flex-col justify-between min-h-[180px] hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden`}
      >
        {/* Text Content */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-black mb-2">{card.title}</h3>
          {card.description && (
            <p className="text-base text-black/80 leading-relaxed pr-16">
              {card.description}
            </p>
          )}
        </div>

        {/* Image Container */}
        <div className="absolute left-40 top-13 w-36 h-40 flex items-center justify-center">
          {!imgError ? (
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-64 object-contain transition-transform duration-300 hover:scale-110"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center text-black text-lg font-bold backdrop-blur-sm">
              {card.title.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

const HeroSectionComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-white px-10">
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side: Text Content */}
          <div className="space-y-8 pt-8">
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-7xl font-bold text-black leading-none tracking-tight">
                Book Your
                <br />
                <span className="text-black">Space</span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-md">
                {sub_heading}
              </p>
            </div>
          </div>

          {/* Right Side: Cards Grid */}
          <div className="grid grid-cols-2 gap-4 auto-rows-fr">
            {cardData.map((card, idx) => (
              <Card key={idx} card={card} color={cardColors[idx]} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSectionComponent;
