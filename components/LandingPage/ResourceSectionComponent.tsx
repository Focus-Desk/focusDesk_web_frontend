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
    icon: Calculator,
    bgColor: "bg-gradient-to-br from-purple-200 to-purple-300",
    iconBgColor: "bg-orange-400",
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
    icon: Building,
    bgColor: "bg-gradient-to-br from-orange-200 to-orange-300",
    iconBgColor: "bg-slate-600",
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
    icon: Users,
    bgColor: "bg-gradient-to-br from-blue-200 to-blue-300",
    iconBgColor: "bg-slate-700",
    resources: [
      "30/60/90 Day Revision Plans",
      "Top Coaching Institutes' Free Resources (Allen, FIITJEE, Resonance)"
    ]
  },
  {
    id: 4,
    title: "SSC",
    subtitle: "SSC",
    icon: Award,
    bgColor: "bg-gradient-to-br from-yellow-200 to-yellow-300",
    iconBgColor: "bg-yellow-600",
    resources: [
      "Tier-wise Syllabus (Tier 1, Tier 2, Tier 3)",
      "Daily Practice Questions",
      "Vocabulary PDFs (One Word, Idioms, Synonyms/Antonyms)"
    ]
  }
]

export default function ResourcesSectionComponent() {
  return (
    <section className="py-20 bg-slate-50 px-12" id="resources">
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
          spaceBetween={30}
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
              slidesPerView: 2,
              spaceBetween: 30,
            },
          }}
          className="resources-swiper"
        >
          {resourcesData.map((resource) => {
            const IconComponent = resource.icon
            return (
              <SwiperSlide key={resource.id}>
                <Card className={`${resource.bgColor} border-0 rounded-2xl h-72 hover:shadow-lg transition-all duration-300 hover:scale-105 p-10`}>
                  <CardHeader className="">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-800 mb-1">
                          {resource.title}
                        </CardTitle>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`w-16 h-16 ${resource.iconBgColor} rounded-xl flex items-center justify-center mb-2 shadow-md`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 bg-white/70 px-3 py-1 rounded-full">
                          {resource.subtitle}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      {resource.resources.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-slate-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-slate-700 text-sm leading-relaxed font-medium">
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
