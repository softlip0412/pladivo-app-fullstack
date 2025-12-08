import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm hover:shadow-md hover:scale-105",
        gradient:
          "border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg animate-gradient bg-[length:200%_auto]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:shadow-md",
        success:
          "border-transparent bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm hover:shadow-md",
        warning:
          "border-transparent bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm hover:shadow-md",
        info:
          "border-transparent bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:shadow-md",
        outline: "text-foreground border-gray-300 hover:bg-gray-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, pulse = false, ...props }) {
  return (
    <div 
      className={cn(
        badgeVariants({ variant }), 
        pulse && "animate-pulse-glow",
        className
      )} 
      {...props} 
    />
  );
}

export { Badge, badgeVariants };
