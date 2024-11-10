import { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, Tooltip, ZAxis } from 'recharts';
import { DomainMetric } from './types';
import { NetworkTooltip } from './NetworkTooltip';
import { NetworkAxis } from './NetworkAxis';

interface NetworkChartProps {
  domains: [string, DomainMetric][];
  formatTime: (time: number) => string;
}

export function NetworkChart({ domains, formatTime }: NetworkChartProps) {
  const chartData = useMemo(() => {
    // Get all unique timestamps across all domains
    const allTimestamps = new Set(
      domains.flatMap(([_, metric]) => 
        metric.history.map(p => p.relativeTime)
      )
    );

    // Create a sorted array of timestamps
    const timestamps = Array.from(allTimestamps).sort((a, b) => a - b);

    // For each timestamp, create a data point that includes packet counts for all domains
    return timestamps.map(time => {
      const point: Record<string, any> = { time };
      
      // Add packet count for each domain at this timestamp
      domains.forEach(([domain, metric]) => {
        const dataPoint = metric.history.find(p => p.relativeTime === time);
        point[domain] = dataPoint ? dataPoint.packets : null;
        point[`${domain}_time`] = dataPoint?.absoluteTime;
      });

      return point;
    });
  }, [domains]);

  const xAxisDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 1000];
    const max = Math.max(...chartData.map(d => d.time));
    return [0, max * 1.05]; // 5% padding
  }, [chartData]);

  const yAxisDomain = useMemo(() => {
    const allPackets = domains.flatMap(([_, metric]) => 
      metric.history.map(p => p.packets)
    );
    const max = Math.max(...allPackets, 1);
    return [0, Math.ceil(max * 1.1)]; // Add 10% padding
  }, [domains]);

  if (chartData.length === 0) {
    return (
      <div className="h-32 w-full flex items-center justify-center text-xs text-muted-foreground">
        No network activity recorded
      </div>
    );
  }

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, bottom: 30, left: 35 }}
        >
          <NetworkAxis.Y 
            domain={yAxisDomain}
            allowDecimals={false}
          />
          <NetworkAxis.X 
            dataKey="time"
            domain={xAxisDomain}
            tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
          />
          <Tooltip
            content={<NetworkTooltip />}
            cursor={{
              stroke: 'hsl(var(--muted-foreground))',
              strokeWidth: 1,
              strokeDasharray: '3 3'
            }}
          />
          {domains.map(([domain, metric]) => (
            <Line
              key={domain}
              type="monotone"
              dataKey={domain}
              name={domain}
              stroke={metric.color}
              strokeWidth={2}
              dot={{
                r: 3,
                fill: metric.color,
                strokeWidth: 0
              }}
              activeDot={{
                r: 4,
                fill: metric.color,
                stroke: 'hsl(var(--background))',
                strokeWidth: 2
              }}
              connectNulls
              animationBegin={0}
              animationDuration={750}
              animationEasing="ease-in-out"
              isAnimationActive={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}