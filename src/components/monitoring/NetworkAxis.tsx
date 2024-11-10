import { XAxis, YAxis } from 'recharts';

interface XAxisProps {
  dataKey: string;
  domain: [number, number];
  tickFormatter: (value: number) => string;
}

interface YAxisProps {
  domain: [number, number];
  allowDecimals?: boolean;
}

function X({ dataKey, domain, tickFormatter }: XAxisProps) {
  return (
    <XAxis
      dataKey={dataKey}
      type="number"
      domain={domain}
      height={30}
      tick={{
        fill: 'hsl(var(--muted-foreground))',
        fontSize: 10
      }}
      tickLine={{
        stroke: 'hsl(var(--muted-foreground))',
        strokeWidth: 1
      }}
      axisLine={{
        stroke: 'hsl(var(--muted-foreground))',
        strokeWidth: 1
      }}
      minTickGap={30}
      tickFormatter={tickFormatter}
      label={{
        value: 'Time since first request',
        position: 'bottom',
        offset: 15,
        style: {
          fill: 'hsl(var(--muted-foreground))',
          fontSize: 10
        }
      }}
      interval="preserveStartEnd"
    />
  );
}

function Y({ domain, allowDecimals = false }: YAxisProps) {
  return (
    <YAxis
      width={35}
      domain={domain}
      allowDecimals={allowDecimals}
      tick={{
        fill: 'hsl(var(--muted-foreground))',
        fontSize: 10
      }}
      tickLine={{
        stroke: 'hsl(var(--muted-foreground))',
        strokeWidth: 1
      }}
      axisLine={{
        stroke: 'hsl(var(--muted-foreground))',
        strokeWidth: 1
      }}
      minTickGap={20}
      label={{
        value: 'Packets',
        angle: -90,
        position: 'left',
        offset: 10,
        style: {
          fill: 'hsl(var(--muted-foreground))',
          fontSize: 10,
          textAnchor: 'middle'
        }
      }}
    />
  );
}

export const NetworkAxis = {
  X,
  Y
};