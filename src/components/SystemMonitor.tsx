import { useEffect, useState } from 'react';
import { Shield, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NetworkMetrics {
  packets: {
    sent: number;
    received: number;
  };
}

export function SystemMonitor() {
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    packets: { sent: 0, received: 0 },
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasActivity, setHasActivity] = useState(false);

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[];
      
      if (entries.length > 0) {
        setHasActivity(true);
      }
      
      setMetrics((prev) => ({
        packets: {
          sent: prev.packets.sent + entries.length,
          received: prev.packets.received + entries.length,
        },
      }));
    });

    observer.observe({ 
      entryTypes: ['resource'],
      buffered: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleReset = () => {
    setMetrics({
      packets: { sent: 0, received: 0 },
    });
    setHasActivity(false);
  };

  return (
    <Card className={cn(
      "fixed bottom-16 w-64 transition-all duration-300 ease-in-out",
      "backdrop-blur-sm bg-card/50 border-border/20",
      "shadow-[0_0_0_1px_rgba(var(--primary),0.1),0_1px_2px_rgba(var(--primary),0.1)]",
      "hover:shadow-[0_0_0_1px_rgba(var(--primary),0.2),0_1px_3px_rgba(var(--primary),0.2)]",
      isExpanded ? "h-auto" : "h-10 overflow-hidden",
      // Container-aligned positioning
      "left-[max(1rem,calc((100%-80rem)/2+1rem))]",
      "max-w-[calc(100%-2rem)]"
    )}>
      <div 
        className={cn(
          "p-2 flex items-center justify-between cursor-pointer",
          "bg-gradient-to-r from-transparent via-primary/5 to-transparent",
          "hover:from-transparent hover:via-primary/10 hover:to-transparent",
          "transition-all duration-300"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Privacy Monitor</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={cn(
            "w-2 h-2 rounded-full transition-colors duration-300",
            hasActivity ? "bg-yellow-500" : "bg-green-500"
          )} />
        </div>
      </div>

      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Network Traffic</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xl font-mono flex items-center space-x-1">
                <span>↑</span>
                <span>{metrics.packets.sent}</span>
              </div>
              <div className="text-xs text-muted-foreground">TX Packets</div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-mono flex items-center space-x-1">
                <span>↓</span>
                <span>{metrics.packets.received}</span>
              </div>
              <div className="text-xs text-muted-foreground">RX Packets</div>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground/75">
            All encryption is performed locally
          </p>
        </div>
      </CardContent>
    </Card>
  );
}