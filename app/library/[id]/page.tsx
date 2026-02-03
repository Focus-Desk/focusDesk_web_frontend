"use client"
import React from "react"
import { useParams, useRouter } from "next/navigation"
import { librariesData } from "@/lib/librariesData"
import { motion } from "framer-motion"
import {
    MapPin,
    Clock,
    Users,
    Wifi,
    Zap,
    Coffee,
    Monitor,
    ShieldCheck,
    ArrowLeft,
    ArrowRight,
    Star,
    CheckCircle2,
    Calendar,
    CreditCard
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

export default function LibraryDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const library = librariesData.find((lib) => lib.id === id)

    if (!library) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Library Not Found</h1>
                    <Button onClick={() => router.push("/")} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </div>
            </div>
        )
    }

    const hourlyRate = Math.floor(library.totalSeats / 10) + 50

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Padding */}
            <div className="h-24" />

            <main className="container mx-auto px-6 md:px-12 py-12">
                {/* Breadcrumbs & Back Button */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Libraries
                    </button>
                </div>

                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Left Column: Gallery & Info */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Gallery */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative rounded-[2.5rem] overflow-hidden bg-gray-100 shadow-2xl aspect-[16/9]"
                        >
                            <Swiper
                                modules={[Navigation, Pagination]}
                                navigation
                                pagination={{ clickable: true }}
                                className="h-full w-full"
                            >
                                {library.photos.map((photo, index) => (
                                    <SwiperSlide key={index}>
                                        <img
                                            src={photo}
                                            alt={`${library.libraryName} - ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                            <div className="absolute top-6 left-6 z-10">
                                <Badge className="bg-white/90 backdrop-blur-md text-emerald-600 border-0 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    <CheckCircle2 className="w-3 h-3 mr-1.5" /> {library.review_status}
                                </Badge>
                            </div>
                        </motion.div>

                        {/* Title & Headline Info */}
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                                    {library.libraryName}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
                                        <Star className="w-4 h-4 text-blue-600 mr-2" />
                                        <span className="text-sm font-bold text-blue-900">4.9 (120+ Reviews)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-6 text-gray-500">
                                <div className="flex items-center text-sm font-medium">
                                    <MapPin className="h-4 w-4 text-blue-500 mr-2" />
                                    {library.address}
                                </div>
                                <div className="flex items-center text-sm font-medium">
                                    <Clock className="h-4 w-4 text-emerald-500 mr-2" />
                                    {library.openingTime} - {library.closingTime}
                                </div>
                                <div className="flex items-center text-sm font-medium">
                                    <Users className="h-4 w-4 text-indigo-500 mr-2" />
                                    {library.totalSeats} Total Seats
                                </div>
                            </div>

                            <p className="text-lg text-gray-600 leading-relaxed font-medium bg-gray-50 p-8 rounded-[2rem]">
                                {library.description || "Welcome to Focus Desk's premium partner library. This space is meticulously designed to provide a distraction-free environment, featuring ergonomic seating, high-speed connectivity, and modern amenities to support your academic and professional goals."}
                            </p>
                        </div>

                        {/* Facilities Section */}
                        <div className="space-y-10">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
                                    <ShieldCheck className="mr-3 h-8 w-8 text-blue-600" /> Amenities & Features
                                </h2>
                                <Badge variant="outline" className="border-blue-100 text-blue-600 px-4 py-1 rounded-full">
                                    {library.facilities.length} features
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {library.facilities.slice(0, 6).map((facility, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mr-4 group-hover:bg-blue-600 transition-colors">
                                            {facility.toLowerCase().includes("wi-fi") ? <Wifi className="h-6 w-6 text-blue-600 group-hover:text-white" /> :
                                                facility.toLowerCase().includes("power") ? <Zap className="h-6 w-6 text-amber-500 group-hover:text-white" /> :
                                                    facility.toLowerCase().includes("tea") || facility.toLowerCase().includes("coffee") ? <Coffee className="h-6 w-6 text-emerald-600 group-hover:text-white" /> :
                                                        facility.toLowerCase().includes("monitor") || facility.toLowerCase().includes("computers") ? <Monitor className="h-6 w-6 text-indigo-600 group-hover:text-white" /> :
                                                            <CheckCircle2 className="h-6 w-6 text-blue-500 group-hover:text-white" />}
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 tracking-tight">{facility}</span>
                                    </div>
                                ))}
                            </div>

                            {library.facilities.length > 6 && (
                                <div className="p-8 rounded-[2rem] bg-gray-50/50 border border-gray-100 mt-8">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">More Library Features</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-4 gap-x-6">
                                        {library.facilities.slice(6).map((facility, index) => (
                                            <div key={index} className="flex items-center text-sm font-medium text-gray-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-300 mr-3" />
                                                {facility}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Booking Card */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-32">
                            <Card className="rounded-[2.5rem] border-0 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
                                <div className="bg-gray-950 p-10 text-white relative overflow-hidden">
                                    {/* Decorative background element */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl" />

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Premium Pricing</span>
                                            <Badge className="bg-emerald-500 text-white border-0 font-bold px-3">BEST VALUE</Badge>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-6xl font-[1000] tracking-tighter">₹{hourlyRate}</span>
                                            <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">/ Hr</span>
                                        </div>
                                    </div>
                                </div>

                                <CardContent className="p-10 space-y-10 bg-white">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Plan Your Session</label>
                                        <div className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer group">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                                    <Calendar className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900">Today, Feb 3</p>
                                                    <p className="text-[10px] font-medium text-gray-500 italic">Select your date</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                        </div>

                                        <div className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer group">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                                    <Clock className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900">Immediate Start</p>
                                                    <p className="text-[10px] font-medium text-gray-500 italic">24 slots available</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50">Open Now</Badge>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
                                        <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest">Focus Benefits Included</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {["No Noise", "AC Room", "High-WiFi", "Safe Hub"].map((benefit, i) => (
                                                <div key={i} className="flex items-center text-[10px] font-bold text-blue-700">
                                                    <CheckCircle2 className="h-3 w-3 text-blue-600 mr-2 shrink-0" /> {benefit}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <Button className="w-full h-20 rounded-[1.5rem] bg-blue-600 hover:bg-black text-white font-black text-xl shadow-2xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98] group overflow-hidden relative">
                                            <span className="relative z-10 flex items-center">
                                                Book This Desk <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                            </span>
                                        </Button>
                                        <p className="text-center mt-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                            <Star className="inline w-3 h-3 text-amber-500 mr-1" /> Best in {library.city}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-10 p-6 rounded-[2rem] border border-dashed border-gray-200 text-center">
                                <p className="text-sm font-medium text-gray-500 mb-4">Have questions about the facilities?</p>
                                <Button variant="link" className="text-blue-600 font-black text-xs uppercase tracking-widest">
                                    Contact Host <ArrowRight className="ml-2 h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
