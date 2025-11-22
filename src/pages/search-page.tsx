import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, Download, ArrowRight } from 'lucide-react';
import { useUIStore } from '@/stores';

export function SearchPage() {
  const { setActiveTab } = useUIStore();

  const handleGoToDownload = () => {
    setActiveTab('download');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Search</h1>
          <p className="text-muted-foreground mt-1">
            Search functionality for streaming services
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Search Not Available
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-3">
                The search functionality is not available through the unshackle serve API. 
                This feature would require additional API endpoints that are not currently provided.
              </p>
              
              <div className="space-y-2 text-sm text-blue-700">
                <p><strong>Alternative approach:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Use the <strong>Download</strong> page to enter direct URLs</li>
                  <li>The download page can detect supported services (TUBI, ROKU, etc.)</li>
                  <li>Browse content directly on streaming service websites</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleGoToDownload} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Go to Download Page
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supported Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              The following services are available for direct URL downloads:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
              <div className="p-2 bg-gray-50 rounded">TUBI</div>
              <div className="p-2 bg-gray-50 rounded">ROKU</div>
              <div className="p-2 bg-gray-50 rounded">Netflix (NF)</div>
              <div className="p-2 bg-gray-50 rounded">Disney+ (DSNP)</div>
              <div className="p-2 bg-gray-50 rounded">MAX</div>
              <div className="p-2 bg-gray-50 rounded">Pluto TV</div>
              <div className="text-sm text-muted-foreground p-2">
                ...and many more
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}