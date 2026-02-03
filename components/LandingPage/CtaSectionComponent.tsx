"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Mail, User, HelpCircle, ChevronDown, Sparkles, MessageSquare, Headphones, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import React from "react"

// FAQ data array
const faqData = [
  {
    id: 1,
    question: "How can I book a library seat through Focus Desk?",
    answer: "You can book a library seat by going to the \"Library\" section, selecting your preferred location (if physical), choosing the date & time slot, and clicking \"Book Now.\" For digital study rooms, just pick a time and join directly."
  },
  {
    id: 2,
    question: "What facilities are available in the library spaces?",
    answer: "Library facilities may include Wi-Fi, power backup, AC, study lights, lockers, and clean restrooms. Each listing on Focus Desk displays available amenities so you can choose what suits you best."
  },
  {
    id: 3,
    question: "What is Focus Desk and who is it for?",
    answer: "Focus Desk is a digital study platform designed for students preparing for competitive exams like JEE, NEET, UPSC, CA, and SSC. It offers a structured library of notes, books, PYQs, and expert mentorship — all in one place."
  },
  {
    id: 4,
    question: "How do I connect with a mentor on Focus Desk?",
    answer: "Just head to the Mentors section, explore profiles based on your exam, and click \"Ask a Doubt\" or \"Book a Session\". Our mentors include toppers, subject experts, and certified educators."
  }
]

export default function CtaSectionComponent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id)
  }

  return (
    <section id="cta" className="relative pt-40 pb-48 px-6 md:px-12 scroll-m-20 overflow-hidden bg-[#020617]">
      {/* SECTION TRANSITION - OBSIDIAN FADE */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5 z-20" />
      {/* CINEMATIC DARK BACKGROUND SYSTEM */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ x: [-100, 100, -100], y: [-50, 50, -50], rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[10%] w-[70%] h-[70%] bg-blue-900/20 rounded-full blur-[160px]"
        />
        <motion.div
          animate={{ x: [100, -100, 100], y: [50, -50, 50], rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[10%] w-[60%] h-[60%] bg-indigo-900/20 rounded-full blur-[140px]"
        />
        <div className="absolute inset-0 bg-[#004aad] opacity-[0.02]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-24 items-start">

          {/* LEFT SIDE - DARK MASTERPIECE FAQ */}
          <div className="space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-8 group cursor-default shadow-2xl">
                <Sparkles className="w-4 h-4 text-blue-400 mr-2.5 group-hover:rotate-12 transition-transform duration-500" />
                <span className="text-[10px] font-[1000] uppercase tracking-[0.4em] text-blue-300/70">Support Hub</span>
              </div>

              <h2 className="text-5xl md:text-7xl font-[1000] text-white leading-[1.1] tracking-[-0.03em] mb-8">
                Got <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 italic">Questions?</span>
              </h2>

              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg">
                Explore our guide to maximize your Focus Desk experience and streamline your studies.
              </p>
            </motion.div>

            <div className="space-y-6">
              {faqData.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  className={`group relative rounded-[2.5rem] overflow-hidden border transition-all duration-700 ${openFaq === faq.id
                    ? "bg-white/10 border-blue-500/30 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]"
                    : "bg-white/[0.03] backdrop-blur-2xl border-white/5 hover:border-white/10 hover:bg-white/[0.06]"
                    }`}
                >
                  <motion.div
                    className="p-8 cursor-pointer select-none"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100 ${openFaq === faq.id ? "bg-blue-600 text-white shadow-lg" : "bg-white/5 text-blue-400"
                          }`}>
                          <HelpCircle className="w-6 h-6" />
                        </div>
                        <h3 className={`font-[700] text-lg tracking-tight transition-colors duration-500 ${openFaq === faq.id ? "text-blue-300" : "text-white/90"
                          }`}>
                          {faq.question}
                        </h3>
                      </div>
                      <motion.div
                        animate={{ rotate: openFaq === faq.id ? 180 : 0 }}
                        transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${openFaq === faq.id ? "border-blue-500/30 bg-blue-500/10 text-blue-400" : "border-white/10 text-white/40"
                          }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {openFaq === faq.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-10 ml-[4.5rem]">
                          <motion.p
                            className="text-slate-400 font-medium leading-relaxed text-base italic pr-8"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                          >
                            &ldquo;{faq.answer}&rdquo;
                          </motion.p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Subtle Dark Shimmer on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1500 ease-in-out pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE - DARK MASTERPIECE BENTO CONTACT */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="lg:sticky lg:top-24"
            >
              <Card className="relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_80px_120px_-40px_rgba(0,0,0,0.6)] rounded-[4rem] overflow-hidden group">
                <CardContent className="p-14 relative z-10">
                  <div className="text-center mb-16">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-4xl font-[900] text-white mb-4 tracking-[-0.02em]">Get in Touch</h3>
                    <p className="text-slate-500 font-medium">Have questions? We&apos;d love to help you get started.</p>
                  </div>

                  <form className="space-y-8" action="https://formsubmit.co/focusdesk.in@gmail.com" method="POST">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-5">
                          Name
                        </Label>
                        <div className="relative group/input">
                          <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within/input:text-blue-400 transition-colors" />
                          <Input
                            name="name"
                            type="text"
                            placeholder="Your Name"
                            className="h-16 pl-16 rounded-3xl border-white/5 bg-white/[0.02] font-semibold text-white placeholder:text-slate-600 focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-5">
                          Email
                        </Label>
                        <div className="relative group/input">
                          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within/input:text-blue-400 transition-colors" />
                          <Input
                            type="email"
                            name="email"
                            required
                            placeholder="hello@desk.com"
                            className="h-16 pl-16 rounded-3xl border-white/5 bg-white/[0.02] font-semibold text-white placeholder:text-slate-600 focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-5">
                        Your Message
                      </Label>
                      <Textarea
                        placeholder="How can we help you crush your goals?"
                        name="message"
                        required
                        rows={5}
                        className="rounded-[2.5rem] border-white/5 bg-white/[0.02] font-semibold text-white placeholder:text-slate-600 focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 p-8 resize-none transition-all"
                      />
                    </div>

                    <div className="relative group/btn pt-4">
                      <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-0 group-hover/btn:opacity-20 transition-opacity duration-500" />
                      <Button
                        type="submit"
                        className="w-full h-18 bg-blue-600 hover:bg-blue-500 text-white font-[900] text-sm uppercase tracking-[0.3em] rounded-3xl shadow-xl active:scale-[0.98] transition-all transform-gpu"
                      >
                        Send Message
                        <ArrowRight className="ml-4 w-5 h-5 group-hover/btn:translate-x-2 transition-transform duration-500" />
                      </Button>
                    </div>
                  </form>

                  <div className="mt-14 pt-10 border-t border-white/10 text-center">
                    <p className="text-[11px] text-slate-500 font-bold tracking-widest uppercase">
                      Contact us directly at{" "}
                      <a href="mailto:support@focusdesk.in" className="text-blue-400 hover:text-blue-300 transition-colors">
                        support@focusdesk.in
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FINAL CALL TO ACTION HINT */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.8 }}
        className="mt-40 text-center relative z-10"
      >
        <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-[1000] text-slate-400 uppercase tracking-widest">
            Ready to redefine your focus? <span className="text-white font-black">Start Your Session</span>
          </span>
        </div>
      </motion.div>

      {/* AMBIENT BOTTOM DEPTH - FOR FOOTER SEPARATION */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-0" />
    </section>
  )
}
