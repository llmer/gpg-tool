import { useState, useEffect, useCallback } from 'react';
import type { NetworkMetrics } from '@/components/monitoring/types';

const DOMAIN_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const initialMetrics: NetworkMetrics = {
  packets: {
    sent: 0,
    received: 0,
    history: [],
  },
  domains: new Map(),
  lastUpdate: Date.now(),
  firstRequest: null,
};

export function useNetworkMonitor() {
  const [metrics, setMetrics] = useState<NetworkMetrics>(initialMetrics);
  const [hasActivity, setHasActivity] = useState(false);

  const handleNetworkRequest = useCallback((entry: PerformanceResourceTiming) => {
    try {
      const url = new URL(entry.name);
      const domain = url.hostname;
      const now = Date.now();
      
      setMetrics(prev => {
        const newDomains = new Map(prev.domains);
        const firstRequest = prev.firstRequest || now;
        
        if (!newDomains.has(domain)) {
          newDomains.set(domain, {
            packets: 0,
            history: [],
            color: DOMAIN_COLORS[newDomains.size % DOMAIN_COLORS.length],
          });
        }
        
        const metric = newDomains.get(domain)!;
        metric.packets += 1;

        // Ensure smooth data points by adding intermediate points if needed
        const lastPoint = metric.history[metric.history.length - 1];
        if (lastPoint && (now - lastPoint.time) > 1000) {
          // Add an intermediate point with the same packet count
          metric.history.push({
            time: lastPoint.time + 500,
            packets: lastPoint.packets,
            relativeTime: lastPoint.relativeTime + 500,
          });
        }

        metric.history.push({
          time: now,
          packets: metric.packets,
          relativeTime: now - firstRequest,
        });

        return {
          packets: {
            sent: prev.packets.sent + 1,
            received: prev.packets.received + 1,
            history: [...prev.packets.history, {
              time: now,
              sent: prev.packets.sent + 1,
              received: prev.packets.received + 1,
            }],
          },
          domains: newDomains,
          lastUpdate: now,
          firstRequest,
        };
      });

      setHasActivity(true);
    } catch (error) {
      console.error('Error processing network request:', error);
    }
  }, []);

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        handleNetworkRequest(entry as PerformanceResourceTiming);
      });
    });

    observer.observe({ 
      entryTypes: ['resource'],
      buffered: true
    });

    // Process any existing entries
    performance.getEntriesByType('resource').forEach((entry) => {
      handleNetworkRequest(entry as PerformanceResourceTiming);
    });

    return () => {
      observer.disconnect();
      performance.clearResourceTimings();
    };
  }, [handleNetworkRequest]);

  const reset = useCallback(() => {
    setMetrics(initialMetrics);
    setHasActivity(false);
    performance.clearResourceTimings();
  }, []);

  return {
    metrics,
    hasActivity,
    reset
  };
}