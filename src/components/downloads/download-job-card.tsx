import { Download, Clock, CheckCircle, XCircle, X, FolderOpen, RotateCcw, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { type DownloadJob } from '@/lib/types';
import { useDownloadsStore } from '@/stores/downloads-store';
import { useCancelJob } from '@/lib/api/queries';
import { useTitleInfo, useTrackInfo } from '@/hooks/use-title-info';

interface DownloadJobCardProps {
  job: DownloadJob;
  variant: 'active' | 'queued' | 'completed' | 'failed';
  className?: string;
}

export function DownloadJobCard({ job, variant, className }: DownloadJobCardProps) {
  const { cancelJob, retryFailedJob } = useDownloadsStore();
  const cancelJobMutation = useCancelJob();
  
  // Extract title_id from job
  const titleId = job.title_id;
  const service = job.service;
  
  // Fetch title and track information
  const { data: titleInfo } = useTitleInfo(service, titleId);
  const { data: trackInfo } = useTrackInfo(service, titleId);
  
  const statusConfig = {
    active: {
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      icon: Download,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    queued: {
      bgColor: 'bg-gray-50 dark:bg-gray-950/20',
      borderColor: 'border-gray-200 dark:border-gray-800',
      icon: Clock,
      iconColor: 'text-gray-600 dark:text-gray-400',
    },
    completed: {
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600 dark:text-green-400',
    },
    failed: {
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-800',
      icon: XCircle,
      iconColor: 'text-red-600 dark:text-red-400',
    },
  };
  
  const config = statusConfig[variant];
  const Icon = config.icon;
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      // Handle ISO datetime strings from unshackle API (may not have Z suffix)
      const isoString = dateString.includes('T') && !dateString.endsWith('Z') 
        ? dateString + 'Z' 
        : dateString;
      return new Date(isoString).toLocaleString();
    } catch (error) {
      console.warn('Failed to parse date:', dateString, error);
      return 'Invalid Date';
    }
  };
  
  const formatDuration = (start?: string, end?: string) => {
    if (!start || !end) return null;
    try {
      const startTime = new Date(start.includes('T') && !start.endsWith('Z') ? start + 'Z' : start);
      const endTime = new Date(end.includes('T') && !end.endsWith('Z') ? end + 'Z' : end);
      const duration = endTime.getTime() - startTime.getTime();
      const minutes = Math.floor(duration / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    } catch (error) {
      console.warn('Failed to calculate duration:', start, end, error);
      return null;
    }
  };

  // Get the appropriate start and end times from job
  const getStartTime = () => job.started_time || job.created_time || job.start_time;
  const getEndTime = () => job.completed_time || job.end_time;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format rich media information from track data
  const formatMediaInfo = () => {
    if (!trackInfo) return null;
    
    const parts = [];
    
    // Video information
    const video = trackInfo.video?.[0]; // Best/first video track
    if (video) {
      const codec = video.codec_display || video.codec || 'Video';
      const resolution = video.resolution || (video.width && video.height ? `${video.width}x${video.height}` : '');
      if (resolution) {
        parts.push(`${codec} ${resolution}`);
      } else {
        parts.push(codec);
      }
    }
    
    // Audio information
    const audio = trackInfo.audio?.[0]; // Best/first audio track
    if (audio) {
      const codec = audio.codec_display || audio.codec || 'Audio';
      const channels = audio.channels ? `${audio.channels}.0` : '';
      if (channels) {
        parts.push(`${codec} ${channels}`);
      } else {
        parts.push(codec);
      }
    }
    
    return parts.length > 0 ? parts.join(' • ') : null;
  };

  // Get display title with year
  const getDisplayTitle = () => {
    if (titleInfo && titleInfo.name) {
      const year = titleInfo.year ? ` (${titleInfo.year})` : '';
      return `${titleInfo.name}${year}`;
    }
    return job.content_title;
  };

  const getProgressText = () => {
    if (job.total_bytes && job.downloaded_bytes) {
      return `${formatBytes(job.downloaded_bytes)} / ${formatBytes(job.total_bytes)}`;
    }
    if (job.total_files && job.current_file) {
      return `File ${job.current_file} of ${job.total_files}`;
    }
    return '';
  };
  
  const handleCancel = async () => {
    const id = job.job_id || job.id;
    if (!id) return;
    try {
      await cancelJobMutation.mutateAsync(id);
      cancelJob(id);
    } catch (error) {
      console.error('Failed to cancel job:', error);
    }
  };

  const handleRetry = () => {
    const id = job.job_id || job.id;
    if (!id) return;
    retryFailedJob(id);
  };
  
  const handleOpenFolder = () => {
    // TODO: Implement folder opening functionality
    console.log('Open folder for job:', job.id);
  };
  
  return (
    <Card className={cn(
      config.bgColor,
      config.borderColor,
      "transition-all duration-200",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Icon className={cn("h-5 w-5 flex-shrink-0", config.iconColor)} />
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{getDisplayTitle()}</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {job.service}
                </Badge>
                <span>•</span>
                <span>{formatDate(getStartTime())}</span>
                {getEndTime() && (
                  <>
                    <span>•</span>
                    <span>{formatDuration(getStartTime(), getEndTime())}</span>
                  </>
                )}
              </div>
              {formatMediaInfo() && (
                <div className="text-xs text-muted-foreground mt-1 flex items-center space-x-1">
                  <Monitor className="h-3 w-3" />
                  <span>{formatMediaInfo()}</span>
                </div>
              )}
              
              {/* Error information for failed jobs */}
              {variant === 'failed' && (job.error_message || job.error || job.worker_stderr) && (
                <div className="text-xs text-red-600 mt-1 p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                  <div className="font-medium">Error:</div>
                  <div className="mt-1">
                    {job.error_message || job.error || 'Download failed'}
                  </div>
                  {job.worker_stderr && (
                    <div className="mt-1 text-xs font-mono bg-red-100 dark:bg-red-900/30 p-1 rounded">
                      {job.worker_stderr}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Progress Information */}
            {variant === 'active' && job.progress !== undefined && (
              <div className="text-right">
                <div className="text-sm font-medium">{job.progress}%</div>
                {getProgressText() && (
                  <div className="text-xs text-muted-foreground truncate max-w-32">
                    {getProgressText()}
                  </div>
                )}
                {job.current_file && (
                  <div className="text-xs text-muted-foreground truncate max-w-32">
                    {job.current_file}
                  </div>
                )}
              </div>
            )}
            
            {/* Action Buttons */}
            {(variant === 'active' || variant === 'queued') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={cancelJobMutation.isPending}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {cancelJobMutation.isPending ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            )}
            
            {variant === 'failed' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRetry}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            
            {variant === 'completed' && (
              <Button variant="ghost" size="sm" onClick={handleOpenFolder}>
                <FolderOpen className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        {variant === 'active' && job.progress !== undefined && (
          <div className="mt-3">
            <Progress value={job.progress} className="h-2" />
          </div>
        )}
        
        {/* Error Display */}
        {variant === 'failed' && job.error && (
          <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-300">
            {job.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}