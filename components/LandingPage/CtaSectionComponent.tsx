import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Mail, User, HelpCircle, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

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
    <section id="cta" className="py-24 bg-[#004aad] scroll-m-15 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-[-20deg] translate-x-1/2"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Side - FAQ Section */}
          <div className="text-white">
            <div className="text-center lg:text-left mb-12">
              <h2
                className="text-4xl font-extrabold mb-6 tracking-tight"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Frequently Asked Questions
              </h2>

              <p className="text-xl text-blue-100/80 max-w-lg">
                Get answers to common questions about Focus Desk
              </p>
            </div>

            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden"
                >
                  <motion.div
                    className="p-5 cursor-pointer"
                    onClick={() => toggleFaq(faq.id)}
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <HelpCircle className="w-6 h-6 text-blue-300 mt-0.5 flex-shrink-0" />
                        <h3 className="font-bold text-white text-lg leading-snug">
                          {faq.question}
                        </h3>
                      </div>
                      <motion.div
                        animate={{ rotate: openFaq === faq.id ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-white/70" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {openFaq === faq.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 ml-10">
                          <motion.p
                            className="text-blue-100/90 leading-relaxed text-base"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            {faq.answer}
                          </motion.p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="w-full lg:sticky lg:top-24">
            <Card className="bg-white/98 backdrop-blur-lg border-0 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-10">
                <div className="text-center mb-10">
                  <h3 className="text-3xl font-bold text-slate-800 mb-3">Get in Touch</h3>
                  <p className="text-slate-500 font-medium">Have questions? We&apos;d love to help you get started.</p>
                </div>

                <form className="space-y-6" action="https://formsubmit.co/focusdesk.in@gmail.com" method="POST">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-semibold ml-1">
                      Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        className="h-12 pl-12 rounded-xl border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-semibold ml-1">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        required
                        placeholder="Enter your email"
                        className="h-12 pl-12 rounded-xl border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-slate-700 font-semibold ml-1">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      name="message"
                      required
                      rows={4}
                      className="rounded-xl border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:ring-blue-500 resize-none transition-all p-4"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 bg-[#004aad] hover:bg-[#003c8b] text-white font-bold py-3 text-lg rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                  >
                    Send Message
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <input type="hidden" name="_next" value="http://localhost:3000"></input>
                  <input type="hidden" name="_captcha" value="false"></input>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                  <p className="text-sm text-slate-500">
                    Or reach us directly at{" "}
                    <a href="mailto:support@focusdesk.in" className="text-blue-600 hover:underline font-medium">
                      support@focusdesk.in
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
