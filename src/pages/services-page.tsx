import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, RefreshCw, Globe, Info } from 'lucide-react';
import { useServices } from '@/lib/api/queries';

export function ServicesPage() {
  const { data: services = [], isLoading, error, refetch } = useServices();

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
          <p className="text-muted-foreground mt-1">
            {isLoading ? 'Loading services...' : `${services.length} service${services.length !== 1 ? 's' : ''} available`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Information card about limited functionality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Service Information Only
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Service management features like authentication, configuration, and testing 
              are not available through the unshackle serve API. This page shows read-only 
              information about available services.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading services...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
              <p className="text-lg font-medium">Failed to load services</p>
              <p className="text-muted-foreground">
                {error instanceof Error ? error.message : 'An error occurred while loading services'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && services.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">No services found</p>
              <p className="text-muted-foreground">
                No streaming services are available. Check your unshackle configuration.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && services.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.tag} className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{service.tag}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{service.url}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {service.geofence && service.geofence.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Geographic Regions:</p>
                    <div className="flex flex-wrap gap-1">
                      {service.geofence.map((region) => (
                        <Badge key={region} variant="outline" className="text-xs">
                          {region.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {service.aliases && service.aliases.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Aliases:</p>
                    <div className="flex flex-wrap gap-1">
                      {service.aliases.map((alias) => (
                        <Badge key={alias} variant="secondary" className="text-xs">
                          {alias}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {service.help && (
                  <div>
                    <p className="text-sm font-medium mb-2">Description:</p>
                    <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                      {service.help.split('\n').slice(0, 5).join('\n')}
                      {service.help.split('\n').length > 5 && '...'}
                    </div>
                  </div>
                )}

                {service.title_regex && (
                  <div>
                    <p className="text-sm font-medium mb-2">URL Pattern:</p>
                    <div className="text-xs font-mono bg-gray-50 p-2 rounded break-all">
                      {typeof service.title_regex === 'string' 
                        ? service.title_regex 
                        : service.title_regex?.slice(0, 2).join(' | ')
                      }
                      {Array.isArray(service.title_regex) && service.title_regex.length > 2 && ' ...'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}