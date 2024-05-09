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
  const [hovered, setHovered] = useState<Datum | null | undefined>(null);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    // placement: "bottom",
    middleware: [shift(), offset(-16)],
    strategy: "fixed",
  });

  const hover = useHover(context);

  const clientPoint = useClientPoint(context, {
    axis: "x",
    enabled: isOpen,
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

  const handleInput = useCallback((value: Datum | null | undefined) => {
    setHovered(value);
  }, []);

  const mergedRefs = useMergeRefs([observe, refs.setReference]);

  return (
    <>
      <div className="h-full" ref={mergedRefs} {...getReferenceProps()}>
        <PlotFigure<Datum> onInput={handleInput} options={options} />
      </div>
      <AnimatePresence>
        {isOpen && hovered ? (
          <motion.div
            ref={refs.setFloating}
            style={floatingStyles}
            className="pointer-events-none bg-gray-1 border border-gray-4 min-w-32 rounded shadow-md shadow-gray-1"
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
            <div className="p-2 border-b border-gray-4">
              <p className="text-xs text-gray-11">
                {hovered.date.toLocaleDateString()}
              </p>
            </div>
            <div className="p-2">
              <p className="text-xl text-gray-12 font-semibold">
                {currency(hovered.revenue, { precision: 0 }).format()}
              </p>
              {/* how much under target? */}
              <p
                className={`text-sm ${
                  hovered.revenue > target ? "text-green-11" : "text-red-11"
                }`}
              >
                {currency(hovered.revenue - target, { precision: 0 }).format()}
                &nbsp;
                {hovered.revenue > target ? "over" : "under"} target
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
