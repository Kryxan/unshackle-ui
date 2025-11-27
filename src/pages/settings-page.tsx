import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, RotateCcw, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useSettingsStore } from '@/stores/settings-store';
import { getAPIConfig, validateAPIConfig } from '@/lib/api/api-config';
import { toast } from 'sonner';

export function SettingsPage() {
  const { apiConfig, updateUnshackleConfig, updateTMDBConfig, resetToDefaults, getEffectiveConfig } = useSettingsStore();
  
  const effectiveConfig = getEffectiveConfig();
  const [showUnshackleKey, setShowUnshackleKey] = useState(false);
  const [showTMDBKey, setShowTMDBKey] = useState(false);
  
  // Local form state
  const [unshackleURL, setUnshackleURL] = useState(effectiveConfig.unshackle.baseURL);
  const [unshackleKey, setUnshackleKey] = useState(effectiveConfig.unshackle.apiKey);
  const [tmdbKey, setTMDBKey] = useState(effectiveConfig.tmdb.apiKey);

  const hasEnvUnshackleURL = !!import.meta.env.VITE_UNSHACKLE_API_URL;
  const hasEnvUnshackleKey = !!import.meta.env.VITE_UNSHACKLE_API_KEY;
  const hasEnvTMDBKey = !!import.meta.env.VITE_TMDB_API_KEY;

  const handleSave = () => {
    // Update config
    updateUnshackleConfig({
      baseURL: unshackleURL,
      apiKey: unshackleKey,
    });
    updateTMDBConfig({
      apiKey: tmdbKey,
    });

    // Validate
    const newConfig = getEffectiveConfig();
    const validation = validateAPIConfig(newConfig);

    if (validation.isValid) {
      toast.success('Settings Saved', {
        description: 'API configuration has been updated successfully.',
      });
    } else {
      toast.error('Settings Saved with Warnings', {
        description: validation.errors.join(', '),
      });
    }
  };

  const handleReset = () => {
    resetToDefaults();
    const defaultConfig = getAPIConfig();
    setUnshackleURL(defaultConfig.unshackle.baseURL);
    setUnshackleKey(defaultConfig.unshackle.apiKey);
    setTMDBKey(defaultConfig.tmdb.apiKey);
    
    toast.success('Settings Reset', {
      description: 'Configuration has been reset to environment defaults.',
    });
  };

  const validation = validateAPIConfig(getEffectiveConfig());

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure API connections and application preferences
          </p>
        </div>

        {/* Validation Status */}
        {!validation.isValid && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Configuration Issues</p>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    {validation.errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {validation.isValid && (
          <Card className="border-green-500/20 bg-green-50/5">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Configuration is valid
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Unshackle API Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Unshackle API</CardTitle>
                <CardDescription>
                  Configure connection to your Unshackle serve instance
                </CardDescription>
              </div>
              {hasEnvUnshackleURL && (
                <Badge variant="secondary">From Environment</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unshackle-url">
                API URL
                {hasEnvUnshackleURL && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (VITE_UNSHACKLE_API_URL)
                  </span>
                )}
              </Label>
              <Input
                id="unshackle-url"
                type="url"
                placeholder="http://localhost:8888"
                value={unshackleURL}
                onChange={(e) => setUnshackleURL(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                URL of your running Unshackle serve instance
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unshackle-key">
                API Key
                {hasEnvUnshackleKey && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (VITE_UNSHACKLE_API_KEY)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="unshackle-key"
                  type={showUnshackleKey ? "text" : "password"}
                  placeholder="your-secure-api-key"
                  value={unshackleKey}
                  onChange={(e) => setUnshackleKey(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowUnshackleKey(!showUnshackleKey)}
                >
                  {showUnshackleKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Optional for local development, required for production
              </p>
            </div>
          </CardContent>
        </Card>

        {/* TMDB API Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>TMDB API</CardTitle>
                <CardDescription>
                  Configure The Movie Database API for content metadata
                </CardDescription>
              </div>
              {hasEnvTMDBKey && (
                <Badge variant="secondary">From Environment</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tmdb-key">
                API Key
                {hasEnvTMDBKey && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (VITE_TMDB_API_KEY)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="tmdb-key"
                  type={showTMDBKey ? "text" : "password"}
                  placeholder="your-tmdb-api-key"
                  value={tmdbKey}
                  onChange={(e) => setTMDBKey(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowTMDBKey(!showTMDBKey)}
                >
                  {showTMDBKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Required for content search. Get your key at{' '}
                <a
                  href="https://www.themoviedb.org/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  themoviedb.org/settings/api
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Source Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Configuration Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Settings are loaded in the following order (highest priority first):
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Runtime settings (configured on this page)</li>
                <li>Environment variables (VITE_* in .env file)</li>
                <li>Default values</li>
              </ol>
              <p className="mt-4">
                {apiConfig 
                  ? '✓ Using runtime configuration from this page'
                  : '• Using environment/default configuration'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
