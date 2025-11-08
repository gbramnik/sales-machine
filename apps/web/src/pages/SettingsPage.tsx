import React from 'react';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Configure integrations, AI behaviour, and outbound channel preferences for your workspace.
        </p>
      </header>

      <SettingsPanel />
    </div>
  );
};




