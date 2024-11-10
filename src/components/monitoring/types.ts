export interface DomainMetric {
  packets: number;
  history: Array<{
    time: number;
    packets: number;
    relativeTime: number;
  }>;
  color: string;
}

export interface NetworkMetrics {
  packets: {
    sent: number;
    received: number;
    history: Array<{ time: number; sent: number; received: number }>;
  };
  domains: Map<string, DomainMetric>;
  lastUpdate: number;
  firstRequest: number | null;
}