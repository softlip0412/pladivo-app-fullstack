import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Clock, 
  User, 
  CheckCircle2, 
  Circle, 
  XCircle, 
  PlayCircle,
  FileText,
  Star
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const statusConfig = {
  pending: {
    color: "bg-amber-500",
    icon: Circle,
    badge: "warning",
    label: "Chưa thực hiện",
    dotColor: "border-amber-500 bg-amber-100",
  },
  in_progress: {
    color: "bg-blue-500",
    icon: PlayCircle,
    badge: "default",
    label: "Đang tiến hành",
    dotColor: "border-blue-500 bg-blue-100",
  },
  completed: {
    color: "bg-green-500",
    icon: CheckCircle2,
    badge: "success",
    label: "Đã hoàn thành",
    dotColor: "border-green-500 bg-green-100",
  },
  cancelled: {
    color: "bg-gray-500",
    icon: XCircle,
    badge: "secondary",
    label: "Đã hủy",
    dotColor: "border-gray-500 bg-gray-100",
  },
};

export const TimelineItem = React.forwardRef(
  ({ task, isLast, index, ...props }, ref) => {
    const config = statusConfig[task.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    const formatDeadline = (deadline) => {
      if (!deadline) return "Chưa có deadline";
      try {
        const deadlineDate = new Date(deadline);
        const distance = formatDistanceToNow(deadlineDate, {
          addSuffix: true,
          locale: vi,
        });
        const formatted = format(deadlineDate, "dd/MM/yyyy HH:mm", {
          locale: vi,
        });
        return { distance, formatted };
      } catch {
        return { distance: "", formatted: "N/A" };
      }
    };

    const { distance, formatted } = formatDeadline(task.deadline);

    return (
      <div
        ref={ref}
        className={cn(
          "relative pl-8 pb-8 animate-fade-in",
          "transition-all duration-300"
        )}
        style={{ animationDelay: `${index * 50}ms` }}
        {...props}
      >
        {/* Timeline Line */}
        {!isLast && (
          <div
            className={cn(
              "absolute left-[15px] top-8 bottom-0 w-0.5",
              "bg-gradient-to-b from-indigo-200 to-purple-200"
            )}
          />
        )}

        {/* Status Dot */}
        <div
          className={cn(
            "absolute left-0 top-0 w-8 h-8 rounded-full border-4",
            "flex items-center justify-center shadow-lg",
            "transition-transform hover:scale-110",
            config.dotColor
          )}
        >
          <StatusIcon className={cn("w-4 h-4", config.color.replace("bg-", "text-"))} />
        </div>

        {/* Task Card */}
        <Card
          className={cn(
            "p-4 hover:shadow-lg transition-all duration-300",
            "hover:-translate-y-1 border-2",
            task.status === "completed" && "bg-green-50/50 border-green-200",
            task.status === "in_progress" && "bg-blue-50/50 border-blue-200",
            task.status === "pending" && "bg-amber-50/50 border-amber-200",
            task.status === "cancelled" && "bg-gray-50/50 border-gray-200"
          )}
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">
                  {task.category}
                </h3>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.description}
                  </p>
                )}
              </div>
              <Badge variant={config.badge} className="shrink-0">
                {config.label}
              </Badge>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {/* Deadline */}
              {task.deadline && (
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">{formatted}</div>
                    <div className="text-xs text-muted-foreground">{distance}</div>
                  </div>
                </div>
              )}

              {/* Assigned Staff */}
              {task.staff_id && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="truncate">
                    <span className="font-medium text-foreground">
                      {task.staff_id.full_name || task.custom_owner || "Chưa phân công"}
                    </span>
                  </div>
                </div>
              )}

              {/* Priority */}
              {task.priority && (
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      task.priority === "high" && "bg-red-500",
                      task.priority === "medium" && "bg-yellow-500",
                      task.priority === "low" && "bg-green-500"
                    )}
                  />
                  <span className="text-muted-foreground capitalize">
                    Độ ưu tiên: {task.priority === "high" ? "Cao" : task.priority === "medium" ? "Trung bình" : "Thấp"}
                  </span>
                </div>
              )}
            </div>

            {/* Additional Badges */}
            <div className="flex flex-wrap gap-2">
              {task.report?.submitted_at && (
                <Badge variant="outline" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  Đã báo cáo
                </Badge>
              )}
              {task.evaluation?.rating && (
                <Badge variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Đánh giá: {task.evaluation.rating}/5
                </Badge>
              )}
            </div>

            {/* Notes */}
            {task.notes && (
              <div className="mt-2 p-2 bg-muted/50 rounded-md text-xs text-muted-foreground">
                <span className="font-medium">Ghi chú:</span> {task.notes}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }
);

TimelineItem.displayName = "TimelineItem";

export default TimelineItem;
