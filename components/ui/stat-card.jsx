import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = React.forwardRef(
  ({ 
    className, 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue,
    gradient = false,
    ...props 
  }, ref) => {
    const isPositive = trend === "up";
    
    return (
      <Card
        ref={ref}
        variant={gradient ? "gradient" : "default"}
        className={cn("hover-lift", className)}
        {...props}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          {Icon && (
            <div className={cn(
              "p-2 rounded-lg",
              gradient 
                ? "bg-white/20" 
                : "bg-gradient-to-br from-indigo-50 to-purple-50"
            )}>
              <Icon className={cn(
                "h-4 w-4",
                gradient ? "text-white" : "text-indigo-600"
              )} />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div className={cn(
              "text-3xl font-bold",
              gradient && "text-gradient-indigo"
            )}>
              {value}
            </div>
            {trendValue && (
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                isPositive ? "text-green-600" : "text-red-600"
              )}>
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";

export { StatCard };
