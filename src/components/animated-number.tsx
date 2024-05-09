import { useEffect, useRef } from "react";

import {
  motion,
  useAnimate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import currency from "currency.js";

export function AnimatedNumber({ num }: { num: number }) {
  const ref = useRef(null);

  const [_, animate] = useAnimate();
  const startingValue = useMotionValue(num);

  const currentValue = useTransform(startingValue, (value) =>
    currency(value, { precision: 0 }).format(),
  );

  useEffect(() => {
    animate(startingValue, num, {});
  }, [animate, num, startingValue]);

  return <motion.p ref={ref}>{currentValue}</motion.p>;
}
