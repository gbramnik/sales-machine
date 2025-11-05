import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Clock, 
  Shield, 
  Check,
  ArrowRight,
  Star,
  Users,
  Calendar,
  Mail,
  Target,
  BarChart3,
  Bot
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductShowcase } from './ProductShowcase'
import { TextReveal } from '@/components/animations/TextReveal'
import { FadeInWhenVisible } from '@/components/animations/FadeInWhenVisible'
import { GradientText } from '@/components/animations/GradientText'
import { FloatingElement } from '@/components/animations/FloatingElement'
import { ScaleOnHover } from '@/components/animations/ScaleOnHover'
import { ParticleBackground } from '@/components/animations/ParticleBackground'
import { MeshGradient } from '@/components/animations/MeshGradient'
import { CountUpNumber } from '@/components/animations/CountUpNumber'
import { motion } from 'framer-motion'

interface LandingPageProps {
  onGetStarted: () => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav 
        className="border-b border-gray-200 bg-white/80 backdrop-blur-lg sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <FloatingElement duration={3} yOffset={5}>
                <Sparkles className="w-8 h-8 text-primary-600" />
              </FloatingElement>
              <span className="text-xl font-bold text-gray-900">Sales Machine</span>
            </motion.div>
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Pricing', 'Reviews'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-600 hover:text-gray-900 transition-colors relative group"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {item}
                  <motion.div
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all"
                  />
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <ScaleOnHover>
                  <Button onClick={onGetStarted}>Get Started</Button>
                </ScaleOnHover>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white">
        <MeshGradient />
        <ParticleBackground />
        <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium"
            >
              <FloatingElement duration={2} yOffset={5}>
                <Zap className="w-4 h-4" />
              </FloatingElement>
              Your AI Sales Rep That Never Sleeps
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight">
              <TextReveal text="Book 20+ Qualified Meetings" delay={0.2} />
              <br />
              <GradientText className="text-5xl sm:text-6xl lg:text-7xl font-bold">
                Every Month, On Autopilot
              </GradientText>
            </h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              Sales Machine finds warm leads, personalizes outreach, books meetings, and handles follow-ups—while you focus on closing deals.
            </motion.p>

            {/* CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <ScaleOnHover scale={1.05}>
                <Button 
                  onClick={onGetStarted}
                  size="lg"
                  className="h-14 px-8 text-lg group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Start For Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </ScaleOnHover>
              <ScaleOnHover>
                <Button 
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-lg"
                >
                  Watch Demo
                </Button>
              </ScaleOnHover>
            </motion.div>

            {/* Trust Signals */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-success-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-success-500" />
                Setup in 10 minutes
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-success-500" />
                14-day money-back guarantee
              </div>
            </div>

            {/* Social Proof */}
            <div className="pt-8">
              <p className="text-gray-500 mb-4">Trusted by 5,000+ companies worldwide</p>
              <div className="flex items-center justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-warning-500 fill-warning-500" />
                ))}
                <span className="ml-2 text-gray-900 font-semibold">4.9/5</span>
                <span className="text-gray-600">(1,247 reviews)</span>
              </div>
            </div>

            {/* Hero Product Showcase */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="pt-12 max-w-5xl mx-auto"
            >
              <FloatingElement duration={4} yOffset={10}>
                <ProductShowcase type="dashboard" />
              </FloatingElement>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: 10000, label: 'Meetings Booked', icon: Calendar, suffix: '+' },
              { number: 92, label: 'Email Deliverability', icon: Mail, suffix: '%' },
              { number: 3.5, label: 'More Responses', icon: TrendingUp, suffix: 'x' },
              { number: 75, label: 'Time Saved', icon: Clock, suffix: '%' },
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <FadeInWhenVisible key={stat.label} delay={index * 0.1}>
                  <ScaleOnHover scale={1.08}>
                    <div className="text-center">
                      <FloatingElement duration={3} delay={index * 0.5} yOffset={10}>
                        <Icon className="w-8 h-8 mx-auto mb-3 text-primary-600" />
                      </FloatingElement>
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        <CountUpNumber end={stat.number} suffix={stat.suffix} duration={2000} />
                      </div>
                      <div className="text-gray-600">{stat.label}</div>
                    </div>
                  </ScaleOnHover>
                </FadeInWhenVisible>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Everything You Need to <GradientText>Scale Outbound</GradientText>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From prospecting to meeting-booked, Sales Machine handles the entire sales workflow
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="space-y-24">
            {/* Feature 1 */}
            <FeatureBlock
              title="Find Your Perfect Prospects with AI"
              description="Target 50M+ contacts with advanced filters. Filter by industry, company size, technologies, job titles, and buying signals. AI enrichment adds personalization data automatically."
              icon={<Target className="w-12 h-12 text-primary-600" />}
              features={[
                '50M+ verified B2B contacts',
                'Advanced filters & buying signals',
                'AI-powered enrichment',
                'Real-time data updates',
              ]}
              imagePosition="right"
              showcaseType="onboarding"
            />

            {/* Feature 2 */}
            <FeatureBlock
              title="AI That Writes Better Than Your Best SDR"
              description="Our AI analyzes each prospect's recent activity, job changes, company news, and pain points—then crafts hyper-personalized emails that get replies. No templates, just real conversations."
              icon={<Bot className="w-12 h-12 text-primary-600" />}
              features={[
                'Hyper-personalized emails',
                'Context-aware messaging',
                'A/B testing built-in',
                'VIP account protection',
              ]}
              imagePosition="left"
              showcaseType="review"
            />

            {/* Feature 3 */}
            <FeatureBlock
              title="Land in Primary Inbox, Every Time"
              description="Our enterprise-grade deliverability system warms up domains, verifies emails, and optimizes sending patterns. Say goodbye to spam folders forever."
              icon={<Shield className="w-12 h-12 text-primary-600" />}
              features={[
                '92%+ inbox placement rate',
                'Automatic domain warm-up',
                'Email verification',
                'Spam word detection',
              ]}
              imagePosition="right"
              showcaseType="analytics"
            />

            {/* Feature 4 */}
            <FeatureBlock
              title="Book Meetings on Autopilot"
              description="When a prospect shows interest, our AI qualifies them, handles objections, and books directly on your calendar. You only talk to qualified leads ready to buy."
              icon={<Calendar className="w-12 h-12 text-primary-600" />}
              features={[
                'Auto-qualification',
                'Calendar integration',
                'Smart scheduling',
                'Confirmation & reminders',
              ]}
              imagePosition="left"
              showcaseType="pipeline"
            />

            {/* Feature 5 */}
            <FeatureBlock
              title="Dashboard That Shows What Matters"
              description="Track not just opens and clicks, but actual business impact: opportunities created, pipeline generated, meetings booked, and revenue attributed."
              icon={<BarChart3 className="w-12 h-12 text-primary-600" />}
              features={[
                'Revenue attribution',
                'Pipeline analytics',
                'Campaign performance',
                'Real-time reporting',
              ]}
              imagePosition="right"
              showcaseType="dashboard"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                See Why <GradientText>5,000+ Companies</GradientText> Love Sales Machine
              </h2>
            </div>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "We went from 3 meetings per month to 25. Sales Machine pays for itself 50x over.",
                author: "Sarah Chen",
                role: "CEO @ FinTech Solutions",
                rating: 5,
              },
              {
                quote: "Best cold email tool I've used in 6 years. The AI personalization is scary good.",
                author: "Michael Rodriguez",
                role: "Head of Sales @ TechStart",
                rating: 5,
              },
              {
                quote: "Cancelled all other tools. This is the only sales automation platform we need.",
                author: "Emily Watson",
                role: "Founder @ Growth Partners",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <FadeInWhenVisible key={index} delay={index * 0.2} direction="up">
                <TestimonialCard {...testimonial} />
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-white to-primary-50 relative overflow-hidden">
        <ParticleBackground />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <FadeInWhenVisible>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Start Booking <GradientText>Meetings Today</GradientText>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join 5,000+ companies using Sales Machine to scale their outbound
            </p>
          </FadeInWhenVisible>

          <FadeInWhenVisible delay={0.2}>
            <ScaleOnHover scale={1.02}>
              <motion.div 
                className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-gray-200"
                whileHover={{ 
                  boxShadow: '0 25px 50px -12px rgba(37, 99, 235, 0.25)',
                  borderColor: 'rgba(37, 99, 235, 0.3)'
                }}
              >
                <div className="mb-8">
                  <div className="text-6xl font-bold mb-2">
                    <GradientText className="text-6xl font-bold">
                      $297
                    </GradientText>
                    <span className="text-2xl text-gray-600 font-normal">/month</span>
                  </div>
                  <p className="text-gray-600">Everything you need to scale outbound</p>
                </div>

                <ul className="space-y-4 mb-8 text-left max-w-md mx-auto">
                  {[
                    'Unlimited AI-personalized emails',
                    '50M+ verified B2B contacts',
                    'Automatic meeting booking',
                    'Multi-channel sequences',
                    'Advanced analytics',
                    '24/7 priority support',
                  ].map((feature, index) => (
                    <motion.li 
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="flex items-center gap-3"
                    >
                      <Check className="w-5 h-5 text-success-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <ScaleOnHover scale={1.05}>
                  <Button 
                    onClick={onGetStarted}
                    size="lg"
                    className="w-full h-14 text-lg mb-4 relative overflow-hidden group"
                  >
                    <span className="relative z-10">Start Free Trial</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </ScaleOnHover>
                <p className="text-sm text-gray-600">
                  14-day money-back guarantee • Cancel anytime
                </p>
              </motion.div>
            </ScaleOnHover>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to 10x Your Outbound Pipeline?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of companies booking more meetings with less effort
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg"
            variant="outline"
            className="h-14 px-8 text-lg bg-white text-primary-600 hover:bg-gray-100"
          >
            Get Started For Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 Sales Machine. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Helper Components
const FeatureBlock: React.FC<{
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  imagePosition: 'left' | 'right'
  showcaseType: 'dashboard' | 'onboarding' | 'pipeline' | 'review' | 'analytics'
}> = ({ title, description, icon, features, imagePosition, showcaseType }) => {
  return (
    <FadeInWhenVisible direction={imagePosition === 'left' ? 'right' : 'left'}>
      <div className={cn(
        "grid md:grid-cols-2 gap-12 items-center",
        imagePosition === 'left' && 'md:flex-row-reverse'
      )}>
        <div className={imagePosition === 'left' ? 'md:order-2' : ''}>
          <FloatingElement duration={3} yOffset={10}>
            <div className="mb-6">{icon}</div>
          </FloatingElement>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">{title}</h3>
          <p className="text-lg text-gray-600 mb-6">{description}</p>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <motion.li 
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <Check className="w-5 h-5 text-success-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </motion.li>
            ))}
          </ul>
          <ScaleOnHover>
            <Button onClick={() => {}} className="mt-6">
              Learn More
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </ScaleOnHover>
        </div>
        <div className={cn(imagePosition === 'left' && 'md:order-1')}>
          <ScaleOnHover scale={1.02}>
            <ProductShowcase type={showcaseType} />
          </ScaleOnHover>
        </div>
      </div>
    </FadeInWhenVisible>
  )
}

const TestimonialCard: React.FC<{
  quote: string
  author: string
  role: string
  rating: number
}> = ({ quote, author, role, rating }) => {
  return (
    <ScaleOnHover scale={1.03}>
      <motion.div 
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 h-full"
        whileHover={{ 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          borderColor: 'rgba(37, 99, 235, 0.3)'
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-1 mb-4">
          {[...Array(rating)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            >
              <Star className="w-4 h-4 text-warning-500 fill-warning-500" />
            </motion.div>
          ))}
        </div>
        <p className="text-gray-700 mb-6 italic">"{quote}"</p>
        <div>
          <div className="font-semibold text-gray-900">{author}</div>
          <div className="text-sm text-gray-600">{role}</div>
        </div>
      </motion.div>
    </ScaleOnHover>
  )
}
