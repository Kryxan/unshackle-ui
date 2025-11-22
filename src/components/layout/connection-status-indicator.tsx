import {
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useServices } from "@/lib/api/queries";

interface ConnectionStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function ConnectionStatusIndicator({
  className,
  showDetails = false,
}: ConnectionStatusIndicatorProps) {
  // For unshackle serve, use API connectivity status
  const { data: services, isLoading: servicesLoading, error: servicesError } = useServices();
  
  // Debug logging
  console.log('ConnectionStatusIndicator:', { 
    services, 
    servicesLoading, 
    servicesError,
    servicesCount: services?.length 
  });

  const getStatusConfig = () => {
    if (servicesLoading) {
      return {
        icon: Loader2,
        label: "Connecting...",
        variant: "secondary" as const,
        className: "bg-blue-500 text-white",
        animate: true,
      };
    }
    
    if (services && services.length > 0) {
      return {
        icon: Wifi,
        label: "Connected",
        variant: "default" as const,
        className: "bg-green-500 text-white",
      };
    }
    
    if (servicesError) {
      return {
        icon: WifiOff,
        label: "Disconnected",
        variant: "destructive" as const,
        className: "bg-red-500 text-white",
      };
    }
    
    // Default fallback
    return {
      icon: WifiOff,
      label: "Disconnected", 
      variant: "destructive" as const,
      className: "bg-gray-500 text-white",
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={cn("relative", className)}>
      <Badge
        variant={config.variant}
        className={cn(
          "flex items-center space-x-1 px-2 py-1",
          config.className
        )}
      >
        <Icon className={`h-3 w-3 ${config.animate ? 'animate-spin' : ''}`} />
        <span className="text-xs">{config.label}</span>
      </Badge>
      {showDetails && services && services.length > 0 && (
        <div className="flex flex-col items-end space-y-1 mt-1">
          <span className="text-xs text-muted-foreground">
            {services.length} services available
          </span>
        </div>
      )}
    </div>
  );
}