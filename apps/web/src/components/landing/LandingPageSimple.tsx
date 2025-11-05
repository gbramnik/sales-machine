import React from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Zap, Check, ArrowRight, Star, TrendingUp, Calendar, Mail, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface LandingPageSimpleProps {
  onGetStarted: () => void
  onViewDashboard?: () => void
}

export const LandingPageSimple: React.FC<LandingPageSimpleProps> = ({ onGetStarted, onViewDashboard }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Sales Machine</span>
            </div>
            <div className="flex items-center gap-4">
              {onViewDashboard && (
                <Button 
                  onClick={onViewDashboard} 
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                >
                  View Dashboard
                </Button>
              )}
              <Button onClick={onGetStarted} className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Animated Background Gradient */}
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-20 -right-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium"
            >
              <Zap className="w-4 h-4" />
              Your AI Sales Rep That Never Sleeps
            </motion.div>

            {/* Headline */}
            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Book 20+ Qualified Meetings
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Every Month, On Autopilot
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              Sales Machine finds warm leads, personalizes outreach, books meetings, and handles follow-ups—while you focus on closing deals.
            </motion.p>

            {/* CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-transform"
              >
                Start For Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg hover:scale-105 transition-transform"
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust Signals */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600"
            >
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Setup in 10 minutes
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                14-day money-back guarantee
              </div>
            </motion.div>

            {/* Social Proof */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="pt-8"
            >
              <p className="text-gray-500 mb-4">Trusted by 5,000+ companies worldwide</p>
              <div className="flex items-center justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
                <span className="ml-2 text-gray-900 font-semibold">4.9/5</span>
                <span className="text-gray-600">(1,247 reviews)</span>
              </div>
            </motion.div>

            {/* Hero Image Placeholder */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="pt-12 max-w-5xl mx-auto"
            >
              <div className="relative rounded-xl shadow-2xl overflow-hidden border border-gray-200 bg-white p-6">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                    <p className="text-2xl font-bold text-gray-900">Product Dashboard</p>
                    <p className="text-gray-600 mt-2">Real-time sales automation</p>
                  </div>
                </div>
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-xl opacity-20 -z-10"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { icon: Calendar, number: '10,000+', label: 'Meetings Booked' },
              { icon: Mail, number: '92%', label: 'Email Deliverability' },
              { icon: TrendingUp, number: '3.5x', label: 'More Responses' },
              { icon: Clock, number: '75%', label: 'Time Saved' },
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <Icon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              See Why <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">5,000+ Companies</span> Love Sales Machine
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "We went from 3 meetings per month to 25. Sales Machine pays for itself 50x over.",
                author: "Sarah Chen",
                role: "CEO @ FinTech Solutions",
              },
              {
                quote: "Best cold email tool I've used in 6 years. The AI personalization is scary good.",
                author: "Michael Rodriguez",
                role: "Head of Sales @ TechStart",
              },
              {
                quote: "Cancelled all other tools. This is the only sales automation platform we need.",
                author: "Emily Watson",
                role: "Founder @ Growth Partners",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.03, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            Ready to 10x Your Outbound?
          </motion.h2>
          <Button 
            onClick={onGetStarted}
            size="lg"
            variant="outline"
            className="h-14 px-8 text-lg bg-white text-blue-600 hover:bg-gray-100 hover:scale-105 transition-transform"
          >
            Get Started For Free
          </Button>
        </div>
      </section>
    </div>
  )
}

