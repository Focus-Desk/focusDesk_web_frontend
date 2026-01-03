import { Card,  CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Users, Star} from "lucide-react"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// Libraries data array
const librariesData = [
  {
    id: "06b9cc66-7765-406e-8a04-3701cbe02256",
    address: "J7HW+GCJ, Railway Colony, Mandawali, New Delhi, Delhi, 110092",
    photos: [
      "https://bbitvowiiqynqkdeuujc.supabase.co/storage/v1/object/public/library-photos/librarians/4e1115b1-9538-4bed-96c6-ceab473c1dbd-1744110324264.jpg",
      "https://bbitvowiiqynqkdeuujc.supabase.co/storage/v1/object/public/library-photos/librarians/4e1115b1-9538-4bed-96c6-ceab473c1dbd-1744110324266.jpg"
    ],
    totalSeats: 100,
    createdAt: "2025-04-08 11:05:24.392",
    librarianId: "4e1115b1-9538-4bed-96c6-ceab473c1dbd",
    city: "Delhi",
    closingTime: "23:59",
    googleMapLink: "https://g.co/kgs/Fmx9ZkN",
    libraryName: "Shanti Library",
    openingTime: "00:00",
    pincode: "110092",
    state: "Delhi",
    whatsappNumber: "9873591122",
    facilities: ["Silent Zone", "Daily Newspaper", "Tea & Coffee", "Discussion Room", "Cafeteria", "Water Dispenser", "Private Cabins", "Printing Services", "Power Backup", "Computers", "RO Water"],
    review_status: "approved"
  },
  {
    id: "5f1e6e47-042a-46a2-9331-bdc282f71d9a",
    address: "2nd floor, joshi colony, Delhi -110092",
    photos: [
      "https://bbitvowiiqynqkdeuujc.supabase.co/storage/v1/object/public/library-photos/librarians/000ed0b0-f5c4-4775-b638-fcd85db0c170-1744712094772.jpg",
      "https://bbitvowiiqynqkdeuujc.supabase.co/storage/v1/object/public/library-photos/librarians/000ed0b0-f5c4-4775-b638-fcd85db0c170-1744712094774.jpg"
    ],
    totalSeats: 100,
    createdAt: "2025-04-15 10:14:56.411",
    librarianId: "000ed0b0-f5c4-4775-b638-fcd85db0c170",
    city: "Delhi",
    closingTime: "23:00",
    googleMapLink: "https://www.google.com/maps",
    libraryName: "Parwati Library",
    openingTime: "06:00",
    pincode: "110092",
    state: "Delhi",
    whatsappNumber: "7210042731",
    facilities: ["Proper Lighting", "Books & Journals", "Printing Services", "Private Cabins", "Cafeteria", "Water Dispenser", "Washrooms", "Personal Charging Socket", "CCTV Surveillance", "Fire Safety", "Open-Air Study", "Lunch Room", "Noise Cancellation", "24×7 Open", "First Aid", "Emergency Exit", "Biometric Access", "Personal LED Lights", "Power Backup", "Separate Girls' Area", "Separate Washrooms for Girls & Boys", "Resting Area", "Lockers", "RO Water", "Tea & Coffee", "Silent Zone", "Daily Newspaper", "Magazines"],
    review_status: "approved"
  },
  {
    id: "b045c550-9a8a-4489-902e-1da20cd062aa",
    address: "Ground floor, pandit mohalla, 168, in front of Durga Mandir, Railway Colony, Mandawali, Delhi, 110092",
    photos: [
      "https://bbitvowiiqynqkdeuujc.supabase.co/storage/v1/object/public/library-photos/librarians/000ed0b0-f5c4-4775-b638-fcd85db0c170-1744693571264.png",
      "https://bbitvowiiqynqkdeuujc.supabase.co/storage/v1/object/public/library-photos/librarians/000ed0b0-f5c4-4775-b638-fcd85db0c170-1744693571266.jpeg"
    ],
    totalSeats: 160,
    createdAt: "2025-04-15 05:06:12.008",
    librarianId: "000ed0b0-f5c4-4775-b638-fcd85db0c170",
    city: "Delhi",
    closingTime: "23:00",
    googleMapLink: "https://maps.app.goo.gl/YxCE39peLmbA7o5m8",
    libraryName: "Kripa Library",
    openingTime: "06:00",
    pincode: "110092",
    state: "Delhi",
    whatsappNumber: "7838004416",
    facilities: ["Proper Lighting", "Air Conditioning", "High-Speed Wi-Fi", "Books & Journals", "Daily Newspaper", "Magazines", "Printing Services", "Silent Zone", "Group Study Room", "Private Cabins", "Discussion Room", "RO Water", "Water Dispenser", "Resting Area", "Lockers", "Washrooms", "Separate Washrooms for Girls & Boys", "Separate Girls' Area", "Personal Charging Socket", "Personal LED Lights", "Power Backup", "CCTV Surveillance", "Biometric Access", "First Aid", "Fire Safety", "Emergency Exit", "Wheelchair Access", "Noise Cancellation", "24×7 Open", "Lunch Room"],
    review_status: "approved"
  },
  {
    id: "dfd9b985-f400-46ed-841b-d6856c1a014d",
    address: "Phase 1 DLF",
    photos: [
      "https://bbitvowiiqynqkdeuujc.supabase.co/storage/v1/object/public/library-photos/librarians/c9d604ba-01e9-45e9-93c2-2398ba53d309-1744381863617.jpg",
      "https://bbitvowiiqynqkdeuujc.supabase.co/storage/v1/object/public/library-photos/librarians/c9d604ba-01e9-45e9-93c2-2398ba53d309-1744381863617.png"
    ],
    totalSeats: 300,
    createdAt: "2025-04-11 14:31:10.098",
    librarianId: "c9d604ba-01e9-45e9-93c2-2398ba53d309",
    city: "Gurugram",
    closingTime: "12:00",
    googleMapLink: "https://maps.app.goo.gl/XLnL39Ze6RAbP71e7",
    libraryName: "Dheeraj Library",
    openingTime: "08:00",
    pincode: "230010",
    state: "Haryana",
    whatsappNumber: "9354900467",
    facilities: ["Proper Lighting", "Books & Journals", "Printing Services", "Private Cabins", "Cafeteria", "Water Dispenser", "Washrooms", "Personal Charging Socket", "CCTV Surveillance", "Fire Safety", "Open-Air Study", "Noise Cancellation", "Emergency Exit", "Biometric Access", "Personal LED Lights", "Separate Washrooms for Girls & Boys", "Resting Area", "Tea & Coffee", "Discussion Room", "Silent Zone", "Daily Newspaper", "Air Conditioning", "High-Speed Wi-Fi", "Magazines", "Group Study Room", "Computers", "RO Water", "Lockers", "Separate Girls' Area", "Power Backup", "First Aid", "Wheelchair Access", "24×7 Open", "Lunch Room"],
    review_status: "approved"
  }
];

export default function LibrariesSectionComponent() {
  // Calculate hourly rate (you can modify this logic as needed)
  const calculateHourlyRate = (totalSeats: number) => {
    return Math.floor(totalSeats / 10) + 50; // Example calculation
  };

  return (
    <section id="library" className="py-20 bg-slate-50 px-12 scroll-m-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
            Featured Library
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover premium study spaces with world-class amenities designed for your success.
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
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
          className="libraries-swiper"
        >
          {librariesData.map((library) => {
            const hourlyRate = calculateHourlyRate(library.totalSeats);
            
            return (
              <SwiperSlide key={library.id}>
                <Card className="pt-0 overflow-hidden duration-300 hover:shadow-2xl transition-shadow border-2 rounded-xl h-full bg-white">
                  <div className="relative h-56 w-full group">
                    <div className="absolute inset-0 bg-blue-900/30 opacity-0 group-hover:opacity-100  group-hover:scale-105  duration-500  transition-opacity z-10"></div>
                    <img
                      src={library.photos[0] || "/globe.svg"}
                      alt={library.libraryName}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 z-20">
                      <Badge className="bg-blue-600 text-white border-0 px-3 py-1 text-xs font-semibold shadow-md">
                        {library.review_status === "approved" ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 z-20">
                      <div className="flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                        <Users className="h-3 w-3 text-blue-600 mr-1" />
                        <span className="text-xs font-medium text-slate-700">{library.totalSeats} seats</span>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-xl text-slate-800">{library.libraryName}</h3>
                      <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        <Star className="h-4 w-4 fill-blue-500 text-blue-500 mr-1" />
                        <span className="text-sm font-semibold text-blue-700">
                          ₹{hourlyRate}/hr
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-slate-500 mb-3">
                      <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                      <span className="text-sm truncate">{library.address}</span>
                    </div>

                    <div className="flex items-center text-slate-500 mb-4">
                      <Clock className="h-4 w-4 mr-2 text-blue-400" />
                      <span className="text-sm">
                        {library.openingTime} - {library.closingTime}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="text-sm font-medium text-blue-600">{library.city}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {library.facilities?.slice(0, 2).map((facility, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 hover:bg-blue-100 transition-colors"
                        >
                          {facility}
                        </Badge>
                      ))}
                      {library.facilities?.length > 2 && (
                        <Badge
                          variant="outline"
                          className="bg-slate-50 text-slate-600 border-slate-200 px-3 py-1"
                        >
                          +{library.facilities.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  )
}
