import * as Plot from "@observablehq/plot";
import { useEffect, useRef } from "react";

export default function PlotFigure<T>({
  options,
  onInput,
}: {
  options: Plot.PlotOptions;
  onInput?: (value: T | undefined | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (options == null) return;
    if (!containerRef.current) return;
    const plot = Plot.plot(options);

    plot.addEventListener("input", () => {
      onInput?.(plot.value);
    });

    containerRef.current.append(plot);
    return () => plot.remove();
  }, [options, onInput]);

  return (
    <div ref={containerRef}>
      <svg className="sr-only">
        <title>Gradient definitions</title>
        <defs>
          <linearGradient id="green-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--green-8)" />
            <stop offset="100%" stopColor="var(--green-2)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
