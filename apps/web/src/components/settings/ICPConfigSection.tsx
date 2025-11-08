import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { Loader2, Plus, X } from 'lucide-react';

export const ICPConfigSection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    industries: [] as string[],
    job_titles: [] as string[],
    company_sizes: [] as string[],
    locations: [] as string[],
    technologies: [] as string[],
    exclude_industries: [] as string[],
    exclude_companies: [] as string[],
  });
  const [newIndustry, setNewIndustry] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newCompanySize, setNewCompanySize] = useState('');
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getICPConfig();
      setConfig(data as typeof config);
    } catch (error) {
      console.error('Failed to load ICP config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.saveICPConfig(config);
      alert('✅ ICP configuration saved successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to save ICP config');
    } finally {
      setSaving(false);
    }
  };

  const addItem = (field: keyof typeof config, value: string, setter: (v: string) => void) => {
    if (value.trim() && !config[field].includes(value.trim())) {
      setConfig({ ...config, [field]: [...config[field], value.trim()] });
      setter('');
    }
  };

  const removeItem = (field: keyof typeof config, index: number) => {
    setConfig({
      ...config,
      [field]: config[field].filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading ICP configuration...</p>
        </CardContent>
      </Card>
    );
  }

  const ListField = ({
    title,
    field,
    newValue,
    setNewValue,
    placeholder,
  }: {
    title: string;
    field: keyof typeof config;
    newValue: string;
    setNewValue: (v: string) => void;
    placeholder: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
      <div className="flex gap-2 mb-2">
        <Input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem(field, newValue, setNewValue);
            }
          }}
          placeholder={placeholder}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => addItem(field, newValue, setNewValue)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {config[field].map((item, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
          >
            {item}
            <button
              type="button"
              onClick={() => removeItem(field, idx)}
              className="hover:text-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ideal Customer Profile (ICP)</CardTitle>
        <CardDescription>
          Define your target audience to improve LinkedIn scraping and prospect matching
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ListField
            title="Industries"
            field="industries"
            newValue={newIndustry}
            setNewValue={setNewIndustry}
            placeholder="e.g., SaaS, E-commerce"
          />
          <ListField
            title="Job Titles"
            field="job_titles"
            newValue={newJobTitle}
            setNewValue={setNewJobTitle}
            placeholder="e.g., CEO, CTO, VP Sales"
          />
          <ListField
            title="Company Sizes"
            field="company_sizes"
            newValue={newCompanySize}
            setNewValue={setNewCompanySize}
            placeholder="e.g., 10-50, 51-200"
          />
          <ListField
            title="Locations"
            field="locations"
            newValue={newLocation}
            setNewValue={setNewLocation}
            placeholder="e.g., United States, Europe"
          />
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Exclusions</h3>
          <ListField
            title="Exclude Industries"
            field="exclude_industries"
            newValue={newIndustry}
            setNewValue={setNewIndustry}
            placeholder="Industries to exclude"
          />
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exclude Companies
            </label>
            <Input
              placeholder="Comma-separated company names"
              onChange={(e) => {
                const companies = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                setConfig({ ...config, exclude_companies: companies });
              }}
              value={config.exclude_companies.join(', ')}
            />
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
              'Save ICP Configuration'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};





