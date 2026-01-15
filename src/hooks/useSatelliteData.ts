import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TLEData, OrbitalElements, SatellitePosition, parseTLE, propagate, calculateGroundTrack } from '@/lib/orbital-mechanics';

export interface Satellite {
  id: string;
  name: string;
  tle: TLEData;
  elements: OrbitalElements;
  position: SatellitePosition;
  groundTrack: SatellitePosition[];
}

export function useSatelliteData(category: string = 'stations') {
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTLEData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if user is authenticated before calling the edge function
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please log in to view satellite data');
        setIsLoading(false);
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke('fetch-tle', {
        body: { category },
      });

      if (fnError) throw fnError;

      const now = new Date();
      const processedSatellites: Satellite[] = data.satellites.map((tle: TLEData) => {
        const elements = parseTLE(tle);
        const position = propagate(elements, now);
        const groundTrack = calculateGroundTrack(elements, now, elements.period, 2);

        return {
          id: tle.noradId,
          name: tle.name,
          tle,
          elements,
          position,
          groundTrack,
        };
      });

      setSatellites(processedSatellites);
      setLastUpdated(now);
    } catch (err) {
      console.error('failed to fetch tle data:', err);
      setError(err instanceof Error ? err.message : 'failed to fetch satellite data');
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  // update positions in real-time
  const updatePositions = useCallback(() => {
    const now = new Date();
    setSatellites(prev => prev.map(sat => ({
      ...sat,
      position: propagate(sat.elements, now),
    })));
  }, []);

  useEffect(() => {
    fetchTLEData();
  }, [fetchTLEData]);

  // update positions every second
  useEffect(() => {
    const interval = setInterval(updatePositions, 1000);
    return () => clearInterval(interval);
  }, [updatePositions]);

  return {
    satellites,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchTLEData,
  };
}
