import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Clock, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Reminder } from "./ReminderCard";

interface ReminderDashboardProps {
  reminders: Reminder[];
  overdueCount: number;
  className?: string;
}

export function ReminderDashboard({
  reminders,
  overdueCount,
  className,
}: ReminderDashboardProps) {
  const { t } = useTranslation("dashboard-main");
  const upcomingReminders = reminders.slice(0, 3);

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>{t("dashboard-main:dashboard.title")}</CardTitle>
          </div>
          {overdueCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {overdueCount} {t("dashboard-main:dashboard.overdue")}
            </Badge>
          )}
        </div>
        <CardDescription>{t("dashboard.dashboardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingReminders.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm">{t("dashboard.noUpcoming")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-start gap-3 pb-3 last:pb-0 border-b last:border-0"
              >
                <Clock
                  className={cn(
                    "h-4 w-4 mt-0.5",
                    reminder.priority === "high"
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {reminder.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("reminders.dueOn", {
                      date: format(reminder.due_date, "MMM d"),
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-between group hover:bg-transparent"
            asChild
          >
            <Link to={t("dashboard.reminderDashboard.reminders_1")}>
              <span>{t("dashboard.viewAll")}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
