import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ApiCredentialsSection } from './ApiCredentialsSection';
import { ICPConfigSection } from './ICPConfigSection';
import { EmailSettingsSection } from './EmailSettingsSection';
import { AISettingsSection } from './AISettingsSection';

export const SettingsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('api-credentials');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Configure your API keys, ideal customer profile, email settings, and AI preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="api-credentials">API Keys</TabsTrigger>
          <TabsTrigger value="icp">ICP Config</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="api-credentials" className="space-y-6">
          <ApiCredentialsSection />
        </TabsContent>

        <TabsContent value="icp" className="space-y-6">
          <ICPConfigSection />
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <EmailSettingsSection />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <AISettingsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};



