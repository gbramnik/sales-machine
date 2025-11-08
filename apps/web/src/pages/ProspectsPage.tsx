import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Upload } from 'lucide-react';

export const ProspectsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Prospects</h1>
        <p className="text-gray-600">
          Manage and review the prospects sourced by your AI Sales Rep. Filter by stage, confidence, or activity to prioritize outreach.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Explore Pipeline
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        </div>
      </header>

      <Card>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Active Prospect Lists</h2>
            <span className="text-sm text-gray-500">Auto-refreshing every 15 minutes</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { title: 'High Intent Leads', count: 18, subtitle: 'Reply probability above 65%' },
              { title: 'Warm Conversations', count: 9, subtitle: 'Awaiting personalized follow-up' },
              { title: 'Needs Enrichment', count: 32, subtitle: 'Missing firmographic signals' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-dashed border-gray-200 bg-white/60 p-4"
              >
                <p className="text-sm font-medium text-gray-500">{item.title}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{item.count}</p>
                <p className="mt-1 text-sm text-gray-500">{item.subtitle}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Prospect-level views and list management will unlock as soon as the onboarding checklist is complete.
          </p>
        </div>
      </Card>
    </div>
  );
};



