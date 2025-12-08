import * as React from "react";
import { cn } from "@/lib/utils";

const PageHeader = React.forwardRef(
  ({ className, title, description, gradient = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl p-8 mb-6",
          gradient
            ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
            : "bg-white border border-gray-200",
          className
        )}
        {...props}
      >
        {gradient && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 animate-gradient bg-[length:200%_auto]" />
        )}
        
        <div className="relative z-10">
          {title && (
            <h1 className="text-3xl font-bold mb-2 animate-fade-in">
              {title}
            </h1>
          )}
          {description && (
            <p className={cn(
              "text-sm animate-slide-up",
              gradient ? "text-white/90" : "text-gray-600"
            )}>
              {description}
            </p>
          )}
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>
      </div>
    );
  }
);

PageHeader.displayName = "PageHeader";

export { PageHeader };
