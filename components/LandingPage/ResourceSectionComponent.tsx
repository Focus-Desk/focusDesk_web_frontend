import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Calculator, Building, Users, Award } from "lucide-react"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// Resources data array
const resourcesData = [
  {
    id: 1,
    title: "Chartered Accountant",
    subtitle: "CA",
    bgColor: "bg-gradient-to-br from-sky-400 to-sky-100",
    accentColor: "text-sky-800",
    bulletColor: "bg-sky-500",
    resources: [
      "ICAI Module PDFs & Practice Manuals",
      "RTPs, MTPs, Suggested Answers (latest + past years)",
      "Amendments Summary PDFs"
    ]
  },
  {
    id: 2,
    title: "UPSC",
    subtitle: "UPSC",
    bgColor: "bg-gradient-to-br from-cyan-400 to-cyan-100",
    accentColor: "text-cyan-800",
    bulletColor: "bg-cyan-500",
    resources: [
      "Daily Current Affairs (e.g. PIB Summary, The Hindu, Indian Express)",
      "Monthly Current Affairs Compilations (Vision IAS, InsightsIAS)",
      "Previous Years' Answer Copies (Topper answers)"
    ]
  },
  {
    id: 3,
    title: "JEE / NEET",
    subtitle: "JEE/NEET",
    bgColor: "bg-gradient-to-br from-blue-400 to-blue-100",
    accentColor: "text-blue-800",
    bulletColor: "bg-blue-500",
    resources: [
      "30/60/90 Day Revision Plans",
      "Top Coaching Institutes' Free Resources (Allen, FIITJEE, Resonance)"
    ]
  },
  {
    id: 4,
    title: "SSC",
    subtitle: "SSC",
    bgColor: "bg-gradient-to-br from-sky-300 to-sky-50",
    accentColor: "text-sky-800",
    bulletColor: "bg-sky-500",
    resources: [
      "Tier-wise Syllabus (Tier 1, Tier 2, Tier 3)",
      "Daily Practice Questions",
      "Vocabulary PDFs (One Word, Idioms, Synonyms/Antonyms)"
    ]
  }
]

export default function ResourcesSectionComponent() {
  return (
    <section className="mt-20 mb-40 bg-slate-50 px-12 scroll-m-25 " id="resources">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
            Resources
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            The Competitive Edge You’ve Been Looking For
          </p>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 1,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
          className="resources-swiper"
        >
          {resourcesData.map((resource) => {
            return (
              <SwiperSlide key={resource.id}>
                <Card className={`${resource.bgColor} border-0 rounded-[2.5rem] h-[26rem] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 p-10 flex flex-col`}>
                  <CardHeader className="pb-6">
                    <CardTitle className={`text-3xl font-bold tracking-tight ${resource.accentColor}`}>
                      {resource.title}
                    </CardTitle>
                    <div className="w-16 h-1 bg-white/50 rounded-full mt-4"></div>
                  </CardHeader>

                  <CardContent className="flex-grow pt-0">
                    <ul className="space-y-4">
                      {resource.resources.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className={`w-2.5 h-2.5 ${resource.bulletColor} rounded-full mt-1.5 mr-4 shadow-sm ring-4 ring-white/30 flex-shrink-0 animate-pulse`}></div>
                          <span className="text-slate-800 text-base leading-snug font-semibold">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </SwiperSlide>
            )
          })}
        </Swiper>

      </div>

    </section>
  )
}
