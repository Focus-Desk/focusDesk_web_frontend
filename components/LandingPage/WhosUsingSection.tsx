import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HeartHandshake, BookOpen } from "lucide-react"

export default function WhosUsingSectionComponent() {
  // Updated image styling with increased width
  const imageStyles = "w-full h-full object-cover"
  
  return (
    <section className="py-10  bg-slate-50 px-12 scroll-m-18" id="about">
     
      <div className="container mx-auto px">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
            Who&apos;s using Focus Desk?
          </h2>
          <p className="text-xl text-slate-600">
            Trusted by students, educators, and institutions worldwide
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Students Card */}
          <Card className="bg-blue-50 pt-0 border-blue-200 hover:shadow-lg transition-shadow overflow-hidden">
            <CardHeader className="pb-4 p-0">
              <div className="w-full min-h-32 flex items-center justify-center mb-4">
                <img 
                  src="/student.png" 
                  alt="Student" 
                  className={imageStyles}
                />
              </div>
              <CardTitle className="text-slate-800 text-center">Students and Self-Learners</CardTitle>
              <CardDescription className="text-slate-600 text-center">
                Boost Your Productivity: Find the perfect place to study, focus deeply, and stay consistent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">Library</Badge>
                <Badge variant="secondary">Focus Mode</Badge>
                <Badge variant="secondary">Resources</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Mentors Card */}
          <Card className="bg-purple-50 pt-0 border-purple-200 hover:shadow-lg transition-shadow overflow-hidden">
            <CardHeader className="p-0">
              <div className="w-full min-h-32 flex items-center justify-center mb-4">
                <img 
                  src="/mentor3.png" 
                  alt="Mentor" 
                  className={imageStyles}
                />
              </div>
              <CardTitle className="text-slate-800 text-center">Mentors and Educators</CardTitle>
              <CardDescription className="text-slate-600 text-center">
                Inspire the Next Generation: Guide students with mentorship and real-world strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">Mentorship</Badge>
                <Badge variant="secondary">Task Management</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Colleges Card */}
          <Card className="bg-yellow-50 pt-0 border-yellow-200 hover:shadow-lg transition-shadow overflow-hidden">
            <CardHeader className="p-0">
              <div className="w-full min-h-32 flex items-center justify-center mb-4">
                <img 
                  src="/libraryownerwb.png" 
                  alt="College Representative" 
                  className={imageStyles}
                />
              </div>
              <CardTitle className="text-slate-800 text-center">Colleges and Study Clubs</CardTitle>
              <CardDescription className="text-slate-600 text-center">
                Empower Academic Success: Partner with Focus Desk to bring structured, distraction-free environments to students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">Library Booking System</Badge>
                <Badge variant="secondary">Mentorship Programs</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trusted By Section */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-slate-800 mb-8">Trusted By</h3>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="text-center">
              <div className="text-red-600 text-2xl font-bold mb-2">DTU</div>
              <div className="text-xs text-slate-500">University</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-2">
                <span className="text-white font-bold">E</span>
              </div>
              <div className="text-xs text-slate-500">E-Cell</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
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
