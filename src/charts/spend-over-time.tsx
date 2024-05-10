import { AnimatedNumber } from "@/components/animated-number";
import PlotFigure from "@/components/plot-figure";
import { usePlotTooltip } from "@/hooks";
import { offset, shift, useMergeRefs } from "@floating-ui/react";
import type { PlotOptions } from "@observablehq/plot";
import * as Plot from "@observablehq/plot";
import currency from "currency.js";
import { subDays } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { forwardRef, useCallback, useMemo, useState } from "react";
import useDimensions from "react-cool-dimensions";

const randomData = Array.from({ length: 30 }, (_, i) => ({
  date: subDays(new Date(), 30 - i),
  revenue: Math.round(Math.random() * 150 + i * 20),
}));

// Generate a random target that's halfway between the min and max revenue.
const target = Math.round(
  randomData.reduce((sum, { revenue }) => sum + revenue, 0) / randomData.length,
);

type Datum = {
  date: Date;
  revenue: number;
};

type ActivePoint = {
  value: Datum;
  pos: [number, number];
};

export function SpendOverTime() {
  const { observe, width, height } = useDimensions();
  const [activePoint, setActivePoint] = useState<ActivePoint>();

  const { getFloatingProps, getReferenceProps, refs, floatingStyles, isOpen } =
    usePlotTooltip({
      position: activePoint?.pos,
      options: {
        placement: "bottom",
        middleware: [shift(), offset(-16)],
        strategy: "fixed",
      },
    });

  const options = useMemo(() => {
    return {
      width,
      height,
      style: {
        fontFamily: "Readex Pro",
      },
      x: {
        line: true,
        label: "Date",
        type: "time",
        interval: "day",
      },
      y: {
        label: "Revenue ($)",
        line: true,
        tickFormat: (d) => {
          return currency(d, { precision: 0 }).format();
        },
      },
      marks: [
        Plot.areaY(randomData, {
          x: "date",
          y: "revenue",
          fill: "url(#green-gradient)",
          stroke: "var(--green-12)",
        }),
        Plot.ruleY([target], {
          stroke: "var(--gray-8)",
          strokeDasharray: "4 4",
        }),
        Plot.crosshairX(randomData, {
          x: "date",
          ruleStroke: "var(--green-12)",
        }),
      ],
    } satisfies PlotOptions;
  }, [width, height]);

  const handleInput = useCallback(
    (value: Datum | null | undefined, plot: Plot.Plot) => {
      if (!value) {
        return;
      }

      const xScale = plot.scale("x");
      const yScale = plot.scale("y");

      const xCoord = xScale?.apply(value.date);
      const yCoord = yScale?.apply(value.revenue);

      setActivePoint({
        value,
        pos: [xCoord, yCoord],
      });
    },
    [],
  );

  const mergedRefs = useMergeRefs([observe, refs.setReference]);

  const activeRevenueDelta = activePoint?.value
    ? activePoint.value.revenue - target
    : 0;

  return (
    <>
      <div
        className="h-full plot-wrap"
        ref={mergedRefs}
        {...getReferenceProps()}
      >
        <PlotFigure<Datum> onInput={handleInput} options={options} />
      </div>
      <AnimatePresence>
        {isOpen && activePoint ? (
          <motion.div
            ref={refs.setFloating}
            style={floatingStyles}
            className="pointer-events-none border border-gray-4 min-w-32 rounded shadow-md shadow-gray-1 bg-gray-1"
            {...getFloatingProps()}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            initial={{
              opacity: 0,
            }}
          >
            <SpendTooltip
              delta={activeRevenueDelta}
              value={activePoint.value}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

const SpendTooltip = forwardRef<
  HTMLDivElement,
  { value: Datum; delta: number }
>(({ value, delta }, ref) => {
  return (
    <div ref={ref}>
      <div className="px-3 py-1.5 border-b border-gray-4">
        <p className="text-xs text-gray-12">
          {value.date.toLocaleDateString()}
        </p>
      </div>
      <div
        className={`p-3 bg-gradient-to-br transition-colors ${
          delta > 0 ? "from-green-a2 to-green-a1" : "from-red-a2 to-red-a1"
        }`}
      >
        <div className="text-xl text-gray-12 font-semibold">
          <AnimatedNumber num={value.revenue} />
        </div>
        <p className={`text-sm ${delta > 0 ? "text-green-11" : "text-red-11"}`}>
          {currency(value.revenue - target, {
            precision: 0,
          }).format()}{" "}
          {delta > 0 ? "above" : "under"} target
        </p>
      </div>
    </div>
  );
});
