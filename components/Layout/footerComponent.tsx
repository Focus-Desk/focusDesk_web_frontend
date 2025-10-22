import { BookOpen } from "lucide-react"
import Link from "next/link"

export default function FooterComponent() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-inter)' }}>
                Focus Desk
              </span>
            </div>
            <p className="text-slate-400">
              Empowering students to find their perfect study environment and achieve academic success.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <div className="space-y-2">
              <Link href="#" className="text-slate-400 hover:text-white block">Libraries</Link>
              <Link href="#" className="text-slate-400 hover:text-white block">Events</Link>
              <Link href="#" className="text-slate-400 hover:text-white block">Membership</Link>
              <Link href="#" className="text-slate-400 hover:text-white block">Pricing</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <div className="space-y-2">
              <Link href="#" className="text-slate-400 hover:text-white block">About</Link>
              <Link href="#" className="text-slate-400 hover:text-white block">Careers</Link>
              <Link href="#" className="text-slate-400 hover:text-white block">Contact</Link>
              <Link href="#" className="text-slate-400 hover:text-white block">Blog</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <div className="space-y-2">
              <Link href="#" className="text-slate-400 hover:text-white block">Help Center</Link>
              <Link href="#" className="text-slate-400 hover:text-white block">Privacy</Link>
              <Link href="#" className="text-slate-400 hover:text-white block">Terms</Link>
              <Link href="#" className="text-slate-400 hover:text-white block">Status</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 text-center">
          <p className="text-slate-400">
            © 2025 Focus Desk. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
