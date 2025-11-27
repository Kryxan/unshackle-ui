import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator"; // Component not available
import { Loader2, Download, AlertCircle, CheckCircle, Globe, Info } from 'lucide-react';
import { useServices } from '@/lib/api/queries';
import { useStartDownload } from '@/lib/api/queries';
import type { ServiceInfo } from '@/lib/types';

interface DetectedService {
  service: ServiceInfo;
  matches: boolean;
  confidence: 'high' | 'medium' | 'low' | 'manual';
}

export function DownloadPage() {
  const [url, setUrl] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedServices, setDetectedServices] = useState<DetectedService[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceInfo | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'starting' | 'queued' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: servicesData, isLoading: servicesLoading } = useServices();
  const startDownloadMutation = useStartDownload();

  // servicesData is now directly the array of services (after API response format fix)
  const services = (servicesData as ServiceInfo[]) || [];

  const detectServices = async () => {
    if (!url.trim() || services.length === 0) return;

    setIsDetecting(true);
    setDetectedServices([]);
    setSelectedService(null);
    setDownloadStatus('idle');
    setErrorMessage('');

    try {
      const detected: DetectedService[] = [];

      // Check each service against the URL
      for (const service of services) {
        let confidence: 'high' | 'medium' | 'low' | null = null;

        // PRIORITY 1: Check URL domain matching first (most reliable)
        if (service.url) {
          try {
            const serviceHostname = new URL(service.url).hostname.toLowerCase();
            const inputUrl = new URL(url.toLowerCase());
            const inputHostname = inputUrl.hostname;
            
            // Exact hostname match or subdomain match
            if (inputHostname === serviceHostname || 
                inputHostname.endsWith('.' + serviceHostname) ||
                serviceHostname.endsWith('.' + inputHostname)) {
              confidence = 'high';
              console.log(`${service.tag}: Domain match - ${inputHostname} matches ${serviceHostname}`);
            }
          } catch (urlError) {
            // Invalid URL, continue to regex check
            console.warn(`Invalid URL for service ${service.tag} or input URL:`, urlError);
          }
        }

        // PRIORITY 2: Check regex patterns (secondary validation)
        if (!confidence && service.title_regex) {
          try {
            // Handle both string and array patterns
            const patterns = Array.isArray(service.title_regex) 
              ? service.title_regex 
              : [service.title_regex];
              
            for (const pattern of patterns) {
              // Convert Python-style named groups (?P<name>...) to JavaScript groups (...)
              const jsPattern = pattern.replace(/\(\?P<\w+>/g, '(');
              const regex = new RegExp(jsPattern);
              const matches = regex.test(url);
              
              if (matches) {
                confidence = 'medium'; // Regex matches are medium confidence
                console.log(`${service.tag}: Regex match - pattern="${jsPattern}"`);
                break; // Stop testing other patterns for this service
              }
            }
          } catch (regexError) {
            console.warn(`Invalid regex for service ${service.tag}:`, regexError);
          }
        }

        // Add to detected services if we found a match
        if (confidence) {
          detected.push({
            service,
            matches: true,
            confidence
          });
        }
      }

      // Check if we have exact domain matches (high confidence)
      const exactMatches = detected.filter(d => d.confidence === 'high');
      
      if (exactMatches.length > 0) {
        // For exact domain matches, only show that service and auto-select it
        setDetectedServices(exactMatches);
        setSelectedService(exactMatches[0].service);
        console.log(`Auto-selected exact match: ${exactMatches[0].service.tag}`);
      } else {
        // No exact matches, show all detected services sorted by confidence
        detected.sort((a, b) => {
          const order = { high: 4, manual: 3, medium: 2, low: 1 };
          return order[b.confidence] - order[a.confidence];
        });
        setDetectedServices(detected);
        
        // Auto-select the best match if available
        if (detected.length > 0) {
          setSelectedService(detected[0].service);
        }
      }

    } catch (error) {
      console.error('Error detecting services:', error);
      setErrorMessage('Failed to detect services');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedService || !url.trim()) return;

    setDownloadStatus('starting');
    setErrorMessage('');

    try {
      const downloadRequest = {
        service: selectedService.tag,
        title_id: url,  // Full URL as required by unshackle serve API
        // Add default options - these could be made configurable later
        quality: '1080p' as const,
        output_path: '/downloads',
        subtitles: true
      };

      await startDownloadMutation.mutateAsync(downloadRequest);
      setDownloadStatus('queued');
      
      // Clear the form after successful download start
      setTimeout(() => {
        setUrl('');
        setDetectedServices([]);
        setSelectedService(null);
        setDownloadStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('Error starting download:', error);
      setDownloadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to start download');
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    // Reset detection when URL changes
    if (detectedServices.length > 0) {
      setDetectedServices([]);
      setSelectedService(null);
      setDownloadStatus('idle');
      setErrorMessage('');
    }
  };

  // Auto-detect services when URL changes (debounced)
  useEffect(() => {
    if (!url.trim() || services.length === 0) return;

    const timeoutId = setTimeout(() => {
      detectServices();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [url, services]);

  const getStatusColor = (confidence: 'high' | 'medium' | 'low' | 'manual') => {
    switch (confidence) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-gray-500';
      case 'manual': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (downloadStatus) {
      case 'starting': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'queued': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Download className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (downloadStatus) {
      case 'starting': return 'Adding to queue...';
      case 'queued': return 'Added to download queue!';
      case 'error': return 'Download failed';
      default: return 'Start Download';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Direct Download</h1>
        <p className="text-muted-foreground mt-1">
          Enter a streaming service URL to download content directly
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            URL Input
          </CardTitle>
          <CardDescription>
            Paste a URL from supported streaming services (e.g., TubiTV, Roku Channel, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Streaming Service URL</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                placeholder="https://tubitv.com/movies/..."
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && detectServices()}
              />
              <Button 
                onClick={detectServices}
                disabled={!url.trim() || isDetecting || servicesLoading}
              >
                {isDetecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Detect Service'
                )}
              </Button>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {errorMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Service Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Service Selection</CardTitle>
          <CardDescription>
            If auto-detection doesn't work, select a service manually
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Service:</label>
              <select 
                aria-label="Select streaming service"
                className="w-full p-2 border border-gray-300 rounded-md"
                onChange={(e) => {
                  const selectedTag = e.target.value;
                  const service = services.find(s => s.tag === selectedTag);
                  if (service) {
                    setSelectedService(service);
                    setDetectedServices([{
                      service,
                      matches: true,
                      confidence: 'manual'
                    }]);
                  }
                }}
                value={selectedService?.tag || ''}
              >
                <option value="">-- Select a service --</option>
                {services.map(service => (
                  <option key={service.tag} value={service.tag}>
                    {service.tag} - {service.url}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {detectedServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Services</CardTitle>
            <CardDescription>
              {detectedServices.length} service(s) can handle this URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {detectedServices.map((detected, index) => (
              <div key={detected.service.tag} className="space-y-2">
                <div 
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedService?.tag === detected.service.tag 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedService(detected.service)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{detected.service.tag}</span>
                          <Badge 
                            variant="secondary" 
                            className={`${getStatusColor(detected.confidence)} text-white`}
                          >
                            {detected.confidence} match
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {detected.service.url}
                        </span>
                      </div>
                    </div>
                    {selectedService?.tag === detected.service.tag && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  
                  {detected.service.help && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div className="line-clamp-2">
                          {detected.service.help.split('\n')[0]}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {index < detectedServices.length - 1 && <div className="border-t my-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {selectedService && (
        <Card>
          <CardHeader>
            <CardTitle>Download Configuration</CardTitle>
            <CardDescription>
              Ready to download from {selectedService.tag}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Service:</span>
                  <span>{selectedService.tag}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">URL:</span>
                  <span className="text-sm text-muted-foreground truncate max-w-md">
                    {url}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Quality:</span>
                  <span>1080p (Best Available)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Audio:</span>
                  <span>Best Available</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Subtitles:</span>
                  <span>All Available</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleDownload} 
              disabled={downloadStatus === 'starting' || downloadStatus === 'queued'}
              className="w-full"
              size="lg"
            >
              {getStatusIcon()}
              <span className="ml-2">{getStatusText()}</span>
            </Button>

            {downloadStatus === 'queued' && (
              <div className="text-center text-sm text-muted-foreground">
                Check the Queue page to monitor download progress
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {detectedServices.length === 0 && url.trim() && !isDetecting && !servicesLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                No supported services detected for this URL
              </p>
              <p className="text-sm text-muted-foreground">
                Make sure the URL is from a supported streaming service
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}