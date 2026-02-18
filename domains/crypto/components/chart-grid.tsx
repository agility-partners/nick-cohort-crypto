interface ChartGridProps {
  padding: number;
  width: number;
  innerH: number;
}

/** Renders horizontal grid lines across the chart area. */
export default function ChartGrid({ padding, width, innerH }: ChartGridProps) {
  return (
    <>
      {[0, 1, 2, 3].map((tick) => {
        const y = padding + (tick / 3) * innerH;
        return (
          <line
            key={tick}
            x1={padding}
            y1={y}
            x2={width - padding}
            y2={y}
            stroke="var(--grid-line)"
            strokeWidth="1"
          />
        );
      })}
    </>
  );
}
