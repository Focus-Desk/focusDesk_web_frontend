"use client"
import { BookOpen, Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone, Github, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import React from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"

export default function FooterComponent() {
  const currentYear = new Date().getFullYear()
  const pathname = usePathname()

  if (pathname.includes("/librarian")) return null;

  return (
    <footer className="relative bg-[#01040a] text-white pt-40 pb-12 overflow-hidden">
      {/* PREMIUM SECTION DIVIDER - SAPPHIRE GLOW */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent z-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[60px] bg-blue-600/10 blur-[50px] z-10 rounded-full" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/60 to-transparent z-0 pointer-events-none" />

      {/* CINEMATIC DARK ATMOSPHERE - REMOVED FOR PERFORMANCE */}
      <div className="absolute inset-0 z-0 bg-[#01040a]" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 items-start mb-24">

          {/* LOGO & BRAND SECTION */}
          <div className="lg:col-span-4 space-y-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex items-center space-x-4 group cursor-pointer"
            >
              <div className="relative w-14 h-14 overflow-hidden rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600/10 group-hover:border-blue-500/30 transition-all duration-500">
                <Image
                  src="/logo.png"
                  alt="Focus Desk Logo"
                  fill
                  className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <span className="text-3xl font-[1000] tracking-tighter" style={{ fontFamily: 'var(--font-inter)' }}>
                Focus Desk
              </span>
            </motion.div>

            <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
              Empowering the next generation of professionals with elite study environments and expert guidance.
            </p>

            <div className="flex items-center gap-4">
              {[Facebook, Twitter, Instagram, Linkedin, Github].map((Icon, idx) => (
                <motion.a
                  key={idx}
                  href="#"
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 group shadow-lg"
                >
                  <Icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* QUICK LINKS - BENTO GLASS COLLUMNS */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
            {[
              {
                title: "Product",
                links: ["Libraries", "Focus Rooms", "Study Tools", "Membership"]
              },
              {
                title: "Company",
                links: ["About Us", "Our Path", "Mentors", "Careers"]
              },
              {
                title: "Support",
                links: ["Help Center", "Privacy Policy", "Terms of Use", "Status"]
              }
            ].map((column, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="space-y-8"
              >
                <h3 className="text-[11px] font-[1000] text-blue-400 uppercase tracking-[0.4em]">
                  {column.title}
                </h3>
                <div className="space-y-4">
                  {column.links.map((link, j) => (
                    <Link
                      key={j}
                      href="#"
                      className="group flex items-center text-slate-400 hover:text-white transition-all duration-300 font-bold"
                    >
                      <span className="relative">
                        {link}
                        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-500 group-hover:w-full transition-all duration-500 rounded-full" />
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 ml-1.5 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-500 text-blue-500" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="relative pt-12 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                <MapPin className="w-4 h-4 text-blue-500" />
                New Delhi, India
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                <Mail className="w-4 h-4 text-blue-500" />
                hello@focusdesk.in
              </div>
            </div>

            <div className="text-slate-500 font-bold text-sm tracking-tight flex items-center">
              © {currentYear} <span className="text-white mx-1.5 font-black tracking-tighter">Focus Desk.</span> All rights reserved.
            </div>
          </div>

          {/* Decorative Background Hint */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-900/40 to-transparent" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(100%) skewX(-15deg); }
        }
      `}</style>
    </footer>
  )
}
