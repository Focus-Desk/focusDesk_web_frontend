import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HeartHandshake, BookOpen } from "lucide-react"

export default function WhosUsingSectionComponent() {
  // Updated image styling with increased width
  const imageStyles = "w-full h-full object-cover"

  return (
    <section className="py-10 bg-slate-50 px-6 md:px-12 scroll-m-18" id="about">

      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
            Who&apos;s using Focus Desk?
          </h2>
          <p className="text-xl text-slate-600">
            Trusted by students, educators, and institutions worldwide
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* ... cards ... */}
        </div>

        {/* Trusted By Section */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-slate-800 mb-8">Trusted By</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            <div className="text-center">
              <div className="text-red-600 text-2xl font-bold mb-2">DTU</div>
              <div className="text-xs text-slate-500">University</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-2 mx-auto">
                <span className="text-white font-bold">E</span>
              </div>
              <div className="text-xs text-slate-500">E-Cell</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-2 mx-auto">
                <div className="w-6 h-6 bg-white rounded"></div>
              </div>
              <div className="text-xs text-slate-500">Hackathons</div>
            </div>
            <div className="text-center">
              <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <div className="text-xs text-slate-500">Local Library</div>
            </div>
            <div className="text-center">
              <HeartHandshake className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <div className="text-xs text-slate-500">Student Unions</div>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}
