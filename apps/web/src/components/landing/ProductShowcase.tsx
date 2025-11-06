import React from 'react'
import { cn } from '@/lib/utils'

interface ProductShowcaseProps {
  type: 'dashboard' | 'onboarding' | 'pipeline' | 'review' | 'analytics'
  className?: string
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({ type, className }) => {
  const showcases = {
    dashboard: (
      <div className={cn("relative rounded-xl shadow-2xl overflow-hidden border border-gray-200", className)}>
        {/* Dashboard Preview with real UI elements */}
        <div className="bg-white p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-semibold">JD</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Welcome back, John!</h3>
                <p className="text-sm text-gray-600">Your AI Rep booked 2 meetings this week 🎉</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                🔔
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Health Score */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Campaign Health</p>
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="#E5E7EB" strokeWidth="4" fill="none" />
                    <circle cx="32" cy="32" r="28" stroke="#10B981" strokeWidth="4" fill="none"
                      strokeDasharray="175.93" strokeDashoffset="17.59" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">92</span>
                  </div>
                </div>
                <span className="text-xs text-success-600">↑ +5</span>
              </div>
            </div>

            {/* Meetings */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Meetings This Week</p>
              <p className="text-3xl font-bold text-gray-900">12</p>
              <p className="text-xs text-success-600 mt-1">↑ +3 from last week</p>
            </div>

            {/* Prospects */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Active Prospects</p>
              <p className="text-3xl font-bold text-gray-900">247</p>
              <div className="text-xs text-gray-600 mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Contacted:</span>
                  <span className="font-semibold">156</span>
                </div>
              </div>
            </div>

            {/* Queue */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Review Queue</p>
              <p className="text-3xl font-bold text-gray-900">8</p>
              <p className="text-xs text-gray-600 mt-1">messages awaiting</p>
            </div>
          </div>

          {/* Pipeline Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Meeting Pipeline</h4>
            <div className="grid grid-cols-4 gap-3">
              {['Contacted', 'Engaged', 'Qualified', 'Booked'].map((stage) => (
                <div key={stage} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-xs font-medium text-gray-700 mb-2">{stage}</div>
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-gray-50 rounded p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 rounded-full bg-primary-100"></div>
                          <div className="flex-1 h-2 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-success-600 rounded-xl blur-xl opacity-20 -z-10"></div>
      </div>
    ),

    onboarding: (
      <div className={cn("relative rounded-xl shadow-2xl overflow-hidden border border-gray-200 bg-white", className)}>
        <div className="p-8">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className={cn(
                "w-3 h-3 rounded-full",
                step <= 2 ? "bg-primary-600" : step === 3 ? "border-2 border-primary-600 animate-pulse" : "border-2 border-gray-300"
              )} />
            ))}
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Who are you trying to reach?</h3>
            <p className="text-gray-600">Tell us about your ideal customer</p>
          </div>

          {/* Industry grid */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {['💼', '🚀', '💻', '🏥', '🏢', '⚡', '🎨', '📊', '🔧', '🌟'].map((emoji, i) => (
              <div key={i} className={cn(
                "aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all",
                i === 0 ? "border-primary-600 bg-primary-50" : "border-gray-200 hover:border-primary-300"
              )}>
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs text-gray-600">Industry</span>
              </div>
            ))}
          </div>

          {/* ICP Preview */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Based on your selection:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><span className="font-medium">Job Titles:</span> VP Marketing, CMO</p>
              <p><span className="font-medium">Company Size:</span> 50-500 employees</p>
              <p><span className="font-medium">Location:</span> France, Belgium, Switzerland</p>
            </div>
          </div>
        </div>
      </div>
    ),

    pipeline: (
      <div className={cn("relative rounded-xl shadow-2xl overflow-hidden border border-gray-200 bg-white", className)}>
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { stage: 'Contacted', count: 156, color: 'bg-blue-500' },
              { stage: 'Engaged', count: 64, color: 'bg-purple-500' },
              { stage: 'Qualified', count: 27, color: 'bg-warning-500' },
              { stage: 'Booked', count: 12, color: 'bg-success-500' },
            ].map((col) => (
              <div key={col.stage} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">{col.stage}</span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{col.count}</span>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn("w-6 h-6 rounded-full", col.color)}></div>
                        <div className="flex-1">
                          <div className="h-2 bg-gray-200 rounded w-full mb-1"></div>
                          <div className="h-1.5 bg-gray-100 rounded w-3/4"></div>
                        </div>
                        {i === 1 && <span className="text-xs">👑</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-success-50 text-success-600 px-2 py-0.5 rounded">92%</span>
                        <span className="text-xs text-gray-500">2h ago</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    review: (
      <div className={cn("relative rounded-xl shadow-2xl overflow-hidden border border-gray-200 bg-white", className)}>
        <div className="grid grid-cols-5 divide-x divide-gray-200">
          {/* Left: Message */}
          <div className="col-span-3 p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">To: Sarah Chen</p>
              <p className="text-xs text-gray-500">sarah.chen@fintech.com</p>
              <p className="text-sm font-medium text-gray-700 mt-2">Subject: Your team's recent hires</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="space-y-2 text-sm text-gray-700">
                <p>Hi Sarah,</p>
                <p>I noticed your team just brought on two new SDRs—congratulations!</p>
                <p>Many marketing leaders we work with hit a wall when trying to scale their sales development efforts...</p>
                <p className="text-gray-400">[Message content...]</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs bg-success-50 text-success-600 px-2 py-1 rounded">87%</span>
              <span className="text-xs text-gray-500">Generated 10 minutes ago</span>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-primary-600 text-white rounded-lg py-2 text-sm font-medium">
                ✓ Approve
              </button>
              <button className="px-4 border border-gray-300 rounded-lg text-sm">
                Edit
              </button>
              <button className="px-4 border border-error-300 text-error-600 rounded-lg text-sm">
                Reject
              </button>
            </div>
          </div>

          {/* Right: Context */}
          <div className="col-span-2 p-6 bg-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-100"></div>
              <div>
                <p className="font-semibold text-gray-900">Sarah Chen</p>
                <p className="text-sm text-gray-600">VP of Marketing</p>
                <p className="text-sm text-gray-600">FinTech Solutions</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Talking Points:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Recent hire: 2 SDRs</li>
                  <li>• Pain point: Lead gen</li>
                  <li>• Engaged with post</li>
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Recent Activity:</p>
                <p className="text-xs text-gray-600">Posted about challenges onboarding new team (Oct 2)</p>
              </div>

              <div className="bg-warning-50 border-l-4 border-warning-400 p-3 rounded">
                <p className="text-xs font-semibold text-gray-700 mb-1">Why Flagged:</p>
                <p className="text-xs text-gray-600">VIP Account (C-level)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),

    analytics: (
      <div className={cn("relative rounded-xl shadow-2xl overflow-hidden border border-gray-200 bg-white", className)}>
        <div className="p-6">
          {/* Chart header */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Campaign Performance</h4>
            <select className="text-sm border border-gray-300 rounded px-3 py-1">
              <option>Last 30 days</option>
            </select>
          </div>

          {/* Mock chart */}
          <div className="relative h-48 mb-6">
            <svg className="w-full h-full" viewBox="0 0 400 160">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#E5E7EB" strokeWidth="1" />
              ))}
              
              {/* Line chart */}
              <polyline
                points="0,140 50,120 100,100 150,80 200,70 250,60 300,50 350,40 400,30"
                fill="none"
                stroke="#2563EB"
                strokeWidth="3"
                strokeLinecap="round"
              />
              
              {/* Area under */}
              <path
                d="M0,140 L50,120 L100,100 L150,80 L200,70 L250,60 L300,50 L350,40 L400,30 L400,160 L0,160 Z"
                fill="url(#gradient)"
                opacity="0.2"
              />
              
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Emails Sent', value: '15.2K', change: '+12%' },
              { label: 'Replies', value: '847', change: '+23%' },
              { label: 'Meetings', value: '124', change: '+45%' },
              { label: 'Revenue', value: '$284K', change: '+67%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
                <p className="text-xs text-success-600 mt-1">{stat.change}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  }

  return showcases[type]
}





