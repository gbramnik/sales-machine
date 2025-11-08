import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Eye } from 'lucide-react';

const TEMPLATE_CATEGORIES = [
  {
    name: 'Outbound Sequences',
    description: 'Battle-tested cadences tuned by the AI Sales Rep for cold outreach.',
    templates: 12,
  },
  {
    name: 'Nurture Touchpoints',
    description: 'Automations that keep warm leads engaged across email and LinkedIn.',
    templates: 9,
  },
  {
    name: 'Event Follow-ups',
    description: 'Meeting recap and conference follow-up templates with dynamic tokens.',
    templates: 6,
  },
];

export const TemplatesPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
        <p className="text-gray-600">
          Curated playbooks and message templates generated from high-performing Sales Machine customers.
          Choose a template to preview, adapt, and launch into your campaigns.
        </p>
        <Button variant="outline" size="sm" className="mt-2">
          <BookOpen className="mr-2 h-4 w-4" />
          Browse Template Library
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {TEMPLATE_CATEGORIES.map((category) => (
          <Card key={category.name} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">{category.name}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between space-y-4">
              <p className="text-sm text-gray-500">
                {category.templates} templates available
              </p>
              <Button variant="ghost" className="justify-start px-0 text-primary-600">
                <Eye className="mr-2 h-4 w-4" />
                Preview examples
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-3 py-6">
          <h2 className="text-lg font-semibold text-gray-900">Coming Soon</h2>
          <p className="text-sm text-gray-600">
            Template remixing and AI-assisted personalization unlock once onboarding is complete.
            Finish the zero-config wizard to let the system tailor templates to your ICP.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};



