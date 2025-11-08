import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { CheckCircle2, XCircle, Loader2, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

interface ApiCredential {
  id: string;
  service_name: string;
  webhook_url?: string;
  is_active: boolean;
  last_verified_at?: string;
}

const SERVICE_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  phantombuster: 'PhantomBuster',
  instantly: 'Instantly.ai',
  smartlead: 'Smartlead',
  calendly: 'Calendly',
  calcom: 'Cal.com',
  n8n_linkedin_scrape: 'N8N - LinkedIn Scrape',
  n8n_ai_enrichment: 'N8N - AI Enrichment',
  n8n_email_send: 'N8N - Email Send',
  n8n_email_reply: 'N8N - Email Reply',
};

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  openai: 'Used for AI message generation and enrichment',
  phantombuster: 'LinkedIn scraping and automation',
  instantly: 'Email sending and campaign management',
  smartlead: 'Alternative email sending service',
  calendly: 'Meeting booking integration',
  calcom: 'Alternative meeting booking',
  n8n_linkedin_scrape: 'Webhook for LinkedIn scraping workflow',
  n8n_ai_enrichment: 'Webhook for AI enrichment workflow',
  n8n_email_send: 'Webhook for email sending workflow',
  n8n_email_reply: 'Webhook for email reply handling',
};

export const ApiCredentialsSection: React.FC = () => {
  const [credentials, setCredentials] = useState<ApiCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [formData, setFormData] = useState({ service_name: '', api_key: '', webhook_url: '' });
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getApiCredentials();
      setCredentials(data as ApiCredential[]);
    } catch (error) {
      console.error('Failed to load credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service_name) return;

    try {
      setSaving(formData.service_name);
      await apiClient.saveApiCredential({
        service_name: formData.service_name,
        api_key: formData.api_key || undefined,
        webhook_url: formData.webhook_url || undefined,
      });
      await loadCredentials();
      setShowAddForm(false);
      setEditingService(null);
      setFormData({ service_name: '', api_key: '', webhook_url: '' });
    } catch (error: any) {
      alert(error.message || 'Failed to save credential');
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (serviceName: string) => {
    if (!confirm(`Are you sure you want to delete credentials for ${SERVICE_LABELS[serviceName] || serviceName}?`)) {
      return;
    }

    try {
      await apiClient.deleteApiCredential(serviceName);
      await loadCredentials();
    } catch (error: any) {
      alert(error.message || 'Failed to delete credential');
    }
  };

  const handleVerify = async (serviceName: string) => {
    try {
      setVerifying(serviceName);
      const result = await apiClient.verifyApiCredential(serviceName);
      if (result.is_valid) {
        alert('✅ Credential verified successfully!');
      } else {
        alert(`❌ Verification failed: ${result.error || 'Unknown error'}`);
      }
      await loadCredentials();
    } catch (error: any) {
      alert(error.message || 'Failed to verify credential');
    } finally {
      setVerifying(null);
    }
  };

  const startEdit = (credential: ApiCredential) => {
    setEditingService(credential.service_name);
    setFormData({
      service_name: credential.service_name,
      api_key: '', // Never show existing API key for security
      webhook_url: credential.webhook_url || '',
    });
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading credentials...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Credentials</CardTitle>
              <CardDescription>
                Manage your API keys and webhook URLs for external services
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingService(null);
                setFormData({ service_name: '', api_key: '', webhook_url: '' });
              }}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Credential
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddForm && (
            <Card className="bg-gray-50 border-2">
              <CardContent className="pt-6">
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service
                    </label>
                    <select
                      value={formData.service_name}
                      onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={!!editingService}
                      required
                    >
                      <option value="">Select a service...</option>
                      {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.service_name.startsWith('n8n_') ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook URL
                      </label>
                      <Input
                        type="url"
                        value={formData.webhook_url}
                        onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                        placeholder="https://n8n.cloud/webhook/xxx"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <div className="relative">
                        <Input
                          type={showApiKey[formData.service_name] ? 'text' : 'password'}
                          value={formData.api_key}
                          onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                          placeholder="Enter your API key"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowApiKey({
                              ...showApiKey,
                              [formData.service_name]: !showApiKey[formData.service_name],
                            })
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showApiKey[formData.service_name] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={saving === formData.service_name}
                    >
                      {saving === formData.service_name ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : editingService ? (
                        'Update'
                      ) : (
                        'Save'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingService(null);
                        setFormData({ service_name: '', api_key: '', webhook_url: '' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {credentials.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No credentials configured yet.</p>
              <p className="text-sm mt-2">Click "Add Credential" to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {credentials.map((cred) => (
                <Card key={cred.id} className="border-l-4 border-l-primary-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {SERVICE_LABELS[cred.service_name] || cred.service_name}
                          </h3>
                          {cred.is_active ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-red-300 text-red-700">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {SERVICE_DESCRIPTIONS[cred.service_name] || 'No description'}
                        </p>
                        {cred.webhook_url && (
                          <p className="text-xs text-gray-500 font-mono">
                            {cred.webhook_url}
                          </p>
                        )}
                        {cred.last_verified_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last verified: {new Date(cred.last_verified_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerify(cred.service_name)}
                          disabled={verifying === cred.service_name}
                        >
                          {verifying === cred.service_name ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Verify'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(cred)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(cred.service_name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};





