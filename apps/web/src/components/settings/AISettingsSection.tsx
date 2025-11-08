import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';

export const AISettingsSection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    personality_id: '',
    tone: 'professional' as 'professional' | 'casual' | 'friendly' | 'formal',
    confidence_threshold: 80,
    use_vip_mode: true,
    response_templates: [] as string[],
  });
  const [newTemplate, setNewTemplate] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAISettings();
      setSettings(data as typeof settings);
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.saveAISettings(settings);
      alert('✅ AI settings saved successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to save AI settings');
    } finally {
      setSaving(false);
    }
  };

  const addTemplate = () => {
    if (newTemplate.trim()) {
      setSettings({
        ...settings,
        response_templates: [...settings.response_templates, newTemplate.trim()],
      });
      setNewTemplate('');
    }
  };

  const removeTemplate = (index: number) => {
    setSettings({
      ...settings,
      response_templates: settings.response_templates.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading AI settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Settings</CardTitle>
        <CardDescription>
          Configure AI personality, tone, and confidence thresholds for message generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tone
          </label>
          <select
            value={settings.tone}
            onChange={(e) =>
              setSettings({
                ...settings,
                tone: e.target.value as typeof settings.tone,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
            <option value="formal">Formal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confidence Threshold (%)
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            value={settings.confidence_threshold}
            onChange={(e) =>
              setSettings({
                ...settings,
                confidence_threshold: parseInt(e.target.value) || 80,
              })
            }
          />
          <p className="text-xs text-gray-500 mt-1">
            Messages below this confidence level will be flagged for review
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="use_vip_mode"
            checked={settings.use_vip_mode}
            onChange={(e) => setSettings({ ...settings, use_vip_mode: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="use_vip_mode" className="text-sm font-medium text-gray-700">
            Enable VIP Mode
          </label>
          <p className="text-xs text-gray-500">
            (Higher quality messages for VIP accounts)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Response Templates
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newTemplate}
              onChange={(e) => setNewTemplate(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTemplate();
                }
              }}
              placeholder="Enter a response template..."
            />
            <Button type="button" variant="outline" onClick={addTemplate}>
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {settings.response_templates.map((template, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded border"
              >
                <p className="text-sm flex-1">{template}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeTemplate(idx)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save AI Settings'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};





