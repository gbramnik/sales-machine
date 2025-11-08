import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export const EmailSettingsSection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [settings, setSettings] = useState({
    domain: '',
    sending_email: '',
    daily_limit: 20,
    warm_up_enabled: true,
    warm_up_days_required: 14,
    bounce_rate_threshold: 5,
  });
  const [domainVerification, setDomainVerification] = useState<{
    verified: boolean;
    checks: { spf: boolean; dkim: boolean; dmarc: boolean };
    recommendations?: Record<string, string | null>;
  } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getEmailSettings();
      setSettings(data as typeof settings);
    } catch (error) {
      console.error('Failed to load email settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.saveEmailSettings(settings);
      alert('✅ Email settings saved successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to save email settings');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!settings.domain) {
      alert('Please enter a domain first');
      return;
    }

    try {
      setVerifying(true);
      const result = await apiClient.verifyDomain(settings.domain);
      setDomainVerification(result as any);
    } catch (error: any) {
      alert(error.message || 'Failed to verify domain');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading email settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
          <CardDescription>
            Configure your email domain, sending limits, and warm-up settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domain
            </label>
            <div className="flex gap-2">
              <Input
                value={settings.domain}
                onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                placeholder="example.com"
              />
              <Button
                onClick={handleVerifyDomain}
                disabled={verifying || !settings.domain}
                variant="outline"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify DNS'
                )}
              </Button>
            </div>
            {domainVerification && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  {domainVerification.verified ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-700">Domain verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-semibold text-red-700">Domain not verified</span>
                    </>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {domainVerification.checks.spf ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>SPF Record</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {domainVerification.checks.dkim ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>DKIM Record</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {domainVerification.checks.dmarc ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>DMARC Record</span>
                  </div>
                </div>
                {domainVerification.recommendations && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-medium text-gray-700 mb-2">Recommendations:</p>
                    {Object.entries(domainVerification.recommendations)
                      .filter(([_, value]) => value)
                      .map(([key, value]) => (
                        <p key={key} className="text-xs text-gray-600 font-mono">
                          {value}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sending Email Address
            </label>
            <Input
              type="email"
              value={settings.sending_email}
              onChange={(e) => setSettings({ ...settings, sending_email: e.target.value })}
              placeholder="hello@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Sending Limit
            </label>
            <Input
              type="number"
              min="1"
              max="100"
              value={settings.daily_limit}
              onChange={(e) =>
                setSettings({ ...settings, daily_limit: parseInt(e.target.value) || 20 })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum number of emails to send per day (recommended: 20-50 for new domains)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="warm_up_enabled"
              checked={settings.warm_up_enabled}
              onChange={(e) =>
                setSettings({ ...settings, warm_up_enabled: e.target.checked })
              }
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="warm_up_enabled" className="text-sm font-medium text-gray-700">
              Enable Email Warm-up
            </label>
          </div>

          {settings.warm_up_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warm-up Days Required
              </label>
              <Input
                type="number"
                min="7"
                max="30"
                value={settings.warm_up_days_required}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    warm_up_days_required: parseInt(e.target.value) || 14,
                  })
                }
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bounce Rate Threshold (%)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={settings.bounce_rate_threshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  bounce_rate_threshold: parseFloat(e.target.value) || 5,
                })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Campaign will pause if bounce rate exceeds this threshold
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Email Settings'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};





