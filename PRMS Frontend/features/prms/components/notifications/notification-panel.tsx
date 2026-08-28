"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  subtitle: string;
  module: "Procurement" | "Finance" | "Materials" | "HR" | "Sales";
  time: string;
  read: boolean;
  type: "approval" | "alert" | "info";
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "PR-2025-047 awaiting your approval",
    subtitle: "Procurement",
    module: "Procurement",
    time: "2 min ago",
    read: false,
    type: "approval",
  },
  {
    id: "2",
    title: "23 items are below reorder level",
    subtitle: "Materials",
    module: "Materials",
    time: "15 min ago",
    read: false,
    type: "alert",
  },
  {
    id: "3",
    title: "SQ-2025-089 quotation requires review",
    subtitle: "Sales",
    module: "Sales",
    time: "1 hr ago",
    read: false,
    type: "approval",
  },
  {
    id: "4",
    title: "INV-2025-088 is overdue",
    subtitle: "Finance",
    module: "Finance",
    time: "2 hr ago",
    read: false,
    type: "alert",
  },
  {
    id: "5",
    title: "LV-2025-119 leave request submitted",
    subtitle: "HR",
    module: "HR",
    time: "3 hr ago",
    read: true,
    type: "info",
  },
];

const MODULE_COLORS: Record<string, string> = {
  Procurement: "#c1121f",
  Finance:     "#1e50c8",
  Materials:   "#f59e0b",
  HR:          "#8b5cf6",
  Sales:       "#10b981",
};

const TYPE_DOT: Record<string, string> = {
  approval: "#c1121f",
  alert:    "#f59e0b",
  info:     "#6b7280",
};

export function NotificationPanel() {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const panelRef                          = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const dismiss = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#c1121f] text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-[340px] rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">Notifications</span>
              {unread > 0 && (
                <span className="rounded-full bg-[#c1121f] px-2 py-0.5 text-[11px] font-bold text-white">
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-[#1e50c8] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "group relative flex items-start gap-3 border-b border-gray-50 px-4 py-3 transition-colors hover:bg-gray-50",
                    !n.read && "bg-blue-50/40"
                  )}
                >
                  {/* Type dot */}
                  <span
                    className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ background: TYPE_DOT[n.type] }}
                  />

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        n.read ? "font-normal text-gray-600" : "font-semibold text-gray-900"
                      )}
                    >
                      {n.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                        style={{
                          background: MODULE_COLORS[n.module] + "22",
                          color: MODULE_COLORS[n.module],
                        }}
                      >
                        {n.subtitle}
                      </span>
                      <span className="text-[11px] text-gray-400">{n.time}</span>
                    </div>
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={() => dismiss(n.id)}
                    className="ml-1 mt-0.5 flex-shrink-0 rounded p-0.5 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-gray-600"
                    aria-label="Dismiss"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2.5 text-center">
            <a
              href="/prms/audit"
              className="text-xs font-medium text-[#1e50c8] hover:underline"
              onClick={() => setOpen(false)}
            >
              View all activity →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
