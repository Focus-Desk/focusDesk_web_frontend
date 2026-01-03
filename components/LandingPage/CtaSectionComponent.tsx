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
    <section id="cta" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 scroll-m-15">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - FAQ Section */}
          <div className="text-white">
            <div className="text-center lg:text-left">
              <h2 
                className="text-4xl font-bold mb-6"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Frequently Asked Questions
              </h2>
              
              <p className="text-xl text-blue-100 mb-8">
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
                  className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden"
                >
                  <motion.div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleFaq(faq.id)}
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                        <h3 className="font-semibold text-white text-lg leading-tight">
                          {faq.question}
                        </h3>
                      </div>
                      <motion.div
                        animate={{ rotate: openFaq === faq.id ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-white" />
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
                        <div className="px-4 pb-4 ml-8">
                          <motion.p 
                            className="text-blue-100 leading-relaxed"
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
          <div className="w-full">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Get in Touch</h3>
                  <p className="text-slate-600">Have questions? We&apos;d love to help you get started.</p>
                </div>
                
                <form className="space-y-6" action="https://formsubmit.co/focusdesk.in@gmail.com" method="POST">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-medium">
                      Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        required
                        placeholder="Enter your email"
                        className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-slate-700 font-medium">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      name="message"
                      required
                      rows={4}
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
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
