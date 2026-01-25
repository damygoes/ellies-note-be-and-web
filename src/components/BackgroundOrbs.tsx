"use client";

import { motion, useReducedMotion } from "motion/react";

export function BackgroundOrbs() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute left-1/2 top-[-10rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-secondary/15 blur-3xl"
      />
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.05 }}
        className="absolute right-[-10rem] top-[14rem] h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl"
      />
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -30 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.08 }}
        className="absolute left-[-12rem] top-[38rem] h-[32rem] w-[32rem] rounded-full bg-accent/12 blur-3xl"
      />
    </div>
  );
}
