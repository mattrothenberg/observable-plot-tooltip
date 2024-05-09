import { AnimatedNumber } from "@/components/animated-number";
import PlotFigure from "@/components/plot-figure";
import {
  offset,
  shift,
  useClientPoint,
  useFloating,
  useHover,
  useInteractions,
  useMergeRefs,
} from "@floating-ui/react";
import type { PlotOptions } from "@observablehq/plot";
import * as Plot from "@observablehq/plot";
import currency from "currency.js";
import { subDays } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
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

export function SpendOverTime() {
  const [isOpen, setIsOpen] = useState(false);
  const { observe, width, height } = useDimensions();
  const [activeValue, setActiveValue] = useState<Datum | null | undefined>(
    null,
  );
  const [activeCoord, setActiveCoord] = useState<[number, number] | null>(null);

  const { refs, floatingStyles, context, x, y } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom",
    middleware: [shift(), offset(-16)],
    strategy: "fixed",
  });

  const hover = useHover(context);

  const clientPoint = useClientPoint(context, {
    axis: "x",
    enabled: isOpen,
    x: activeCoord?.[0] ?? 0,
    y: 0,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    clientPoint,
  ]);

  const options = useMemo(() => {
    return {
      width,
      height,
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
      const xScale = plot.scale("x");
      const yScale = plot.scale("y");

      if (!value) {
        return;
      }

      const xCoord = xScale?.apply(value.date);
      const yCoord = yScale?.apply(value.revenue);
      setActiveValue(value);
      setActiveCoord([xCoord, yCoord]);
    },
    [],
  );

  const mergedRefs = useMergeRefs([observe, refs.setReference]);
  const activeRevenueDelta = activeValue ? activeValue.revenue - target : 0;

  return (
    <>
      <div className="h-full" ref={mergedRefs} {...getReferenceProps()}>
        <PlotFigure<Datum> onInput={handleInput} options={options} />
      </div>
      <AnimatePresence>
        {isOpen && activeValue ? (
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
            <div className="px-3 py-1.5 border-b border-gray-4">
              <p className="text-xs text-gray-12">
                {activeValue.date.toLocaleDateString()}
              </p>
            </div>
            <div
              className={`p-3 bg-gradient-to-br transition-colors ${
                activeRevenueDelta > 0
                  ? "from-green-a2 to-green-a1"
                  : "from-red-a2 to-red-a1"
              }`}
            >
              <div className="text-xl text-gray-12 font-semibold">
                <AnimatedNumber num={activeValue.revenue} />
              </div>
              <p
                className={`text-sm ${
                  activeRevenueDelta > 0 ? "text-green-11" : "text-red-11"
                }`}
              >
                {currency(activeValue.revenue - target, {
                  precision: 0,
                }).format()}{" "}
                {activeRevenueDelta > 0 ? "above" : "under"} target
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
