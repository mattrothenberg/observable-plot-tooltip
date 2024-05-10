import { useClientPoint, useHover, useInteractions } from "@floating-ui/react";
import { useFloating, type UseFloatingOptions } from "@floating-ui/react";
import { useState } from "react";

export function usePlotTooltip({
  position,
  options,
}: {
  /**
   * The current position of the tooltip, x and y coordinates.
   */
  position: [number, number] | undefined;
  options?: UseFloatingOptions;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    ...options,
  });

  const hover = useHover(context);

  const clientPoint = useClientPoint(context, {
    axis: "x",
    enabled: isOpen,
    x: position?.[0] ?? 0,
    y: 0,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    clientPoint,
  ]);

  return {
    getReferenceProps,
    getFloatingProps,
    refs,
    floatingStyles,
    isOpen,
  };
}
