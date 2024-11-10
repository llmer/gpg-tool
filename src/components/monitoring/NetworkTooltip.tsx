interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    stroke: string;
    dataKey: string;
    payload: {
      time: number;
      packets: number;
      domain: string;
      absoluteTime: number;
    };
  }>;
}

function truncateDomain(domain: string | undefined, maxLength: number = 12): string {
  if (!domain) return '';
  return domain.length > maxLength ? `${domain.slice(0, maxLength)}...` : domain;
}

export function NetworkTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;

  const firstPayload = payload[0]?.payload;
  if (!firstPayload) return null;

  const { time, absoluteTime } = firstPayload;
  const relativeTime = `+${(time / 1000).toFixed(3)}s`;

  const formattedTime = new Date(absoluteTime).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  });

  return (
    <div className="bg-popover/95 border border-border px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm">
      <p className="text-xs font-medium text-foreground">
        {formattedTime}
      </p>
      <p className="text-xs text-muted-foreground">
        {relativeTime}
      </p>
      <div className="mt-1 space-y-1">
        {payload.map((entry) => {
          if (!entry?.payload?.domain) return null;
          return (
            <p key={entry.name} className="text-xs text-muted-foreground">
              <span 
                className="inline-block w-2 h-2 mr-2 rounded-full"
                style={{ backgroundColor: entry.stroke }}
              />
              <span title={entry.payload.domain}>
                {truncateDomain(entry.payload.domain)}: {entry.payload.packets}
              </span>
            </p>
          );
        })}
      </div>
    </div>
  );
}