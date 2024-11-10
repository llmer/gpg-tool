import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Copy, ArrowUp, ArrowDown } from 'lucide-react';
import { DomainMetric } from './types';

interface DomainListProps {
  domains: [string, DomainMetric][];
  txPackets: number;
  rxPackets: number;
}

interface CopyState {
  [key: string]: boolean;
}

export function DomainList({ domains, txPackets, rxPackets }: DomainListProps) {
  const { toast } = useToast();
  const [copiedStates, setCopiedStates] = useState<CopyState>({});

  useEffect(() => {
    const timeouts: { [key: string]: NodeJS.Timeout } = {};

    Object.entries(copiedStates).forEach(([domain, isCopied]) => {
      if (isCopied && !timeouts[domain]) {
        timeouts[domain] = setTimeout(() => {
          setCopiedStates(prev => ({ ...prev, [domain]: false }));
        }, 2000);
      }
    });

    return () => {
      Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [copiedStates]);

  const copyDomain = async (domain: string) => {
    try {
      await navigator.clipboard.writeText(domain);
      setCopiedStates(prev => ({ ...prev, [domain]: true }));
      toast({
        title: "Copied to clipboard",
        description: domain,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-foreground">Domain Activity</h4>
        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1" title="Packets Sent">
            <ArrowUp className="w-3 h-3" />
            <span className="font-mono">{txPackets}</span>
          </div>
          <div className="flex items-center space-x-1" title="Packets Received">
            <ArrowDown className="w-3 h-3" />
            <span className="font-mono">{rxPackets}</span>
          </div>
        </div>
      </div>
      <div className="space-y-1">
        {domains.map(([domain, metric]) => (
          <div 
            key={domain} 
            className="flex justify-between items-center text-xs group"
          >
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <span 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: metric.color }}
              />
              <button
                onClick={() => copyDomain(domain)}
                className="truncate hover:text-foreground transition-colors text-left flex-1"
                title={`Click to copy: ${domain}`}
              >
                {domain}
              </button>
              <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
            <span className="font-mono ml-2 flex-shrink-0">{metric.packets}</span>
          </div>
        ))}
      </div>
    </div>
  );
}