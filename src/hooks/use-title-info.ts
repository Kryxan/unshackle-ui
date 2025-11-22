import { useQuery } from '@tanstack/react-query';
import { apiClientManager } from '@/lib/api/api-client-manager';

interface TitleInfo {
  type: string;
  name: string;
  year: number;
  id: string;
}

interface TrackInfo {
  title: TitleInfo;
  video: Array<{
    codec: string;
    codec_display: string;
    bitrate: number;
    width: number;
    height: number;
    resolution: string;
    fps: number;
    range: string;
    range_display: string;
    language: string;
  }>;
  audio: Array<{
    codec: string;
    codec_display: string;
    bitrate: number;
    channels: number;
    language: string;
    atmos: boolean;
  }>;
  subtitles: Array<{
    codec: string;
    language: string;
    forced: boolean;
  }>;
}

export function useTitleInfo(service: string, titleId: string) {
  return useQuery({
    queryKey: ['titleInfo', service, titleId],
    queryFn: async (): Promise<TitleInfo | null> => {
      try {
        const client = apiClientManager.getUnshackleClient();
        return await client.getTitleInfo(service, titleId);
      } catch (error) {
        console.warn('Failed to fetch title info:', error);
        return null;
      }
    },
    enabled: !!(service && titleId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTrackInfo(service: string, titleId: string) {
  return useQuery({
    queryKey: ['trackInfo', service, titleId],
    queryFn: async (): Promise<TrackInfo | null> => {
      try {
        const client = apiClientManager.getUnshackleClient();
        return await client.getTrackInfo(service, titleId);
      } catch (error) {
        console.warn('Failed to fetch track info:', error);
        return null;
      }
    },
    enabled: !!(service && titleId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}