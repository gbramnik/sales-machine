import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, TrendingUp } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">
          Track campaign momentum, response quality, and meeting conversions across your pipeline.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Meetings Booked</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-semibold text-gray-900">24</p>
            <p className="text-sm text-gray-500">
              Up 18% vs last 14-day cohort. Detailed charts unlock once onboarding checklist is complete.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Reply Quality</CardTitle>
            <LineChart className="h-5 w-5 text-primary-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-semibold text-gray-900">72%</p>
            <p className="text-sm text-gray-500">
              AI scoring indicates steady improvements. Configure analytics destinations in Settings to activate exports.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-3 py-6">
          <h2 className="text-lg font-semibold text-gray-900">Next Steps</h2>
          <p className="text-sm text-gray-600">
            Complete the onboarding checklist to unlock full funnel analytics, dashboard filters, and trend overlays.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};



