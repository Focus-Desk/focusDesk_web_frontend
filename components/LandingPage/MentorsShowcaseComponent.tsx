import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Award, Users } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// JSON data
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

export default function MentorsShowcaseComponent() {
  const imageStyles = "w-24 h-24 rounded-full object-cover mx-auto";

  // Function to get card color based on category - IMPROVED FOR CONSISTENCY
  const getCardTheme = (category: string) => {
    if (category.includes("CA") || category.includes("Chartered Accountant")) {
      return {
        bg: "bg-gradient-to-br from-cyan-400 to-cyan-50",
        border: "border-cyan-200",
        accent: "text-slate-900",
        badge: "bg-white/40 text-slate-800",
      };
    }
    return {
      bg: "bg-gradient-to-br from-sky-400 to-sky-100",
      border: "border-sky-300",
      accent: "text-slate-900",
      badge: "bg-white/40 text-slate-800",
    };
  };

  return (
    <section className="py-16 px-12 bg-slate-50 scroll-m-12" id="mentorship">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Meet Our Expert Mentors
          </h2>
          <p className="text-xl text-slate-600">
            Learn from experienced professionals who have achieved success in
            their fields
          </p>
        </div>

        {/* Swiper Container */}
        <div className="mb-16">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            slidesPerView={1}
            spaceBetween={0}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
            className="mentors-swiper"
          >
            {mentorsData.mentors.map((mentor, index) => {
              const theme = getCardTheme(mentor.category);
              return (
                <SwiperSlide key={index}>
                  <Card
                    className={`${theme.bg} ${theme.border} border-0 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-[34rem] overflow-hidden rounded-[2.5rem]`}
                  >
                    <CardHeader className="text-center pb-2 pt-8">
                      <div className="mb-4">
                        <img
                          src={`/${mentor.image}`}
                          alt={mentor.name}
                          className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-white/30"
                        />
                      </div>
                      <CardTitle className="text-slate-900 text-lg font-bold">
                        {mentor.name}
                      </CardTitle>
                      <CardDescription
                        className={`text-xs font-semibold uppercase tracking-wider ${theme.accent}`}
                      >
                        {mentor.category}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Experience */}
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600">
                          {mentor.experience.years > 1
                            ? `${mentor.experience.years} years`
                            : `${mentor.experience.years} year`}{" "}
                          {mentor.experience.type
                            ? `${mentor.experience.type}`
                            : ""}{" "}
                          experience
                        </span>
                      </div>

                      {/* Top Qualification */}
                      <div className="space-y-2">
                        {mentor.qualifications.map((qualification, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <GraduationCap className="w-4 h-4 text-slate-500 mt-0.5" />
                            <span className="text-sm text-slate-600 line-clamp-2">
                              {qualification}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Achievements */}
                      {mentor.achievements.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Award className="w-4 h-4 text-slate-500 mt-0.5" />
                          <span className="text-sm text-slate-600 line-clamp-2">
                            {mentor.achievements[0]}
                          </span>
                        </div>
                      )}

                      {/* Specializations */}
                      <div className="flex flex-wrap gap-2">
                        {mentor.experience.specialization
                          .slice(0, 2)
                          .map((spec, specIndex) => (
                            <Badge
                              key={specIndex}
                              variant="secondary"
                              className={`${theme.badge} border-0 px-3 py-1 rounded-full text-xs font-semibold`}
                            >
                              {spec}
                            </Badge>
                          ))}
                        {mentor.experience.specialization.length > 2 && (
                          <Badge variant="outline" className="text-xs border-slate-200">
                            +{mentor.experience.specialization.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button className="swiper-button-prev !static !w-10 !h-10 !mt-0 !bg-white !rounded-full !shadow-lg hover:!bg-slate-50 transition-colors">
              <svg
                className="w-5 h-5 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button className="swiper-button-next !static !w-10 !h-10 !mt-0 !bg-white !rounded-full !shadow-lg hover:!bg-slate-50 transition-colors">
              <svg
                className="w-5 h-5 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 overflow-hidden rounded-[2.5rem] bg-[#004aad] p-12 text-center shadow-2xl transition-all duration-500 hover:shadow-blue-500/20">
          <h3 className="mb-12 text-3xl font-bold tracking-tight text-white">
            Why Choose Our Mentors?
          </h3>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="group text-center">
              <div className="mb-2 text-4xl font-black text-white transition-transform duration-300 group-hover:scale-110">15+</div>
              <div className="text-sm font-medium text-blue-100/80">
                Years Combined Experience
              </div>
            </div>
            <div className="group text-center">
              <div className="mb-2 text-4xl font-black text-white transition-transform duration-300 group-hover:scale-110">100+</div>
              <div className="text-sm font-medium text-blue-100/80">Students Mentored</div>
            </div>
            <div className="group text-center">
              <div className="mb-2 text-4xl font-black text-white transition-transform duration-300 group-hover:scale-110">4</div>
              <div className="text-sm font-medium text-blue-100/80">Expert Categories</div>
            </div>
            <div className="group text-center">
              <div className="mb-2 text-4xl font-black text-white transition-transform duration-300 group-hover:scale-110">95%</div>
              <div className="text-sm font-medium text-blue-100/80">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Swiper Styles */}
      <style jsx global>{`
        .mentors-swiper .swiper-pagination {
          position: static !important;
          margin-top: 2rem;
        }

        .mentors-swiper .swiper-pagination-bullet {
          background: #64748b;
          opacity: 0.3;
        }

        .mentors-swiper .swiper-pagination-bullet-active {
          background: #3b82f6;
          opacity: 1;
        }

        .swiper-button-prev:after,
        .swiper-button-next:after {
          display: none;
        }
      `}</style>
    </section>
  );
}
