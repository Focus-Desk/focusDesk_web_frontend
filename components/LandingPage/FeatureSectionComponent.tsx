"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Users, Star, ArrowRight, ArrowLeft } from "lucide-react"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { motion } from "framer-motion"
import Link from "next/link"
import { librariesData } from "@/lib/librariesData"

export default function LibrariesSectionComponent() {
  const calculateHourlyRate = (totalSeats: number) => {
    return Math.floor(totalSeats / 10) + 50;
  };

  return (
    <section id="library" className="py-32 bg-white px-6 md:px-12 scroll-m-20 overflow-hidden relative">
      <div className="absolute top-1/4 left-0 w-1/4 h-1/4 bg-blue-50/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto">
        {/* Animated Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <Star className="w-4 h-4 text-blue-600 mr-2 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/80">Premium Study Hubs</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-[1000] text-gray-900 leading-tight tracking-tight mb-8">
              Featured
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Libraries</span>
            </h2>

            <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Discover hyper-curated study spaces with world-class amenities designed for your peak performance.
            </p>
          </motion.div>
        </div>

        {/* Upgraded Swiper Slider */}
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
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            pagination={{ clickable: true, el: '.swiper-pagination-custom' }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="libraries-swiper !pb-20"
          >
            {librariesData.map((library, idx) => {
              const hourlyRate = calculateHourlyRate(library.totalSeats);

              return (
                <SwiperSlide key={library.id}>
                  <Card className="group relative pt-0 overflow-hidden border-0 rounded-[2.5rem] bg-gray-50 hover:bg-white transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] h-full">
                    {/* Media Container */}
                    <div className="relative h-64 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <img
                        src={library.photos[0] || "/globe.svg"}
                        alt={library.libraryName}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      <div className="absolute top-6 left-6 z-20 flex gap-2">
                        <Badge className="bg-white/90 backdrop-blur-md text-blue-600 border-0 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-lg">
                          {library.review_status === "approved" ? "Verified" : "Pending"}
                        </Badge>
                      </div>

                      <div className="absolute top-6 right-6 z-20">
                        <div className="flex items-center bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                          <Users className="h-3 w-3 text-white mr-1.5" />
                          <span className="text-[10px] font-black text-white uppercase tracking-wider">{library.totalSeats} Seats</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <CardContent className="p-10">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="font-black text-2xl text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                          {library.libraryName}
                        </h3>
                        <div className="flex items-center text-blue-600 font-black text-lg">
                          ₹{hourlyRate}<span className="text-xs text-gray-400 ml-1">/hr</span>
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-center text-gray-500">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                            <MapPin className="h-4 w-4 text-blue-500" />
                          </div>
                          <span className="text-sm font-medium truncate italic">{library.address}</span>
                        </div>

                        <div className="flex items-center text-gray-500">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                            <Clock className="h-4 w-4 text-emerald-500" />
                          </div>
                          <span className="text-sm font-medium">
                            {library.openingTime} - {library.closingTime} • <span className="text-blue-600">{library.city}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-100">
                        {library.facilities?.slice(0, 3).map((facility, index) => (
                          <span
                            key={index}
                            className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:border-blue-100 group-hover:text-blue-500 transition-colors"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>

                      <Link href={`/library/${library.id}`} className="block w-full mt-8">
                        <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center group-hover:bg-blue-600 transition-all shadow-lg">
                          View Details <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </Link>
                    </CardContent>
                  </Card>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Custom Navigation Controls */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 z-30 transition-all duration-300">
            <button className="swiper-button-prev-custom w-14 h-14 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all shadow-sm hover:shadow-xl disabled:opacity-30">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="swiper-pagination-custom flex gap-2 !static !w-auto" />
            <button className="swiper-button-next-custom w-14 h-14 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all shadow-sm hover:shadow-xl disabled:opacity-30">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
