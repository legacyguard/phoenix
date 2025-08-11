import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { expirationIntelligence } from '@/services/expiration-intelligence';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface Notification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  document_id?: string;
  is_read: boolean;
  created_at: string;
  metadata?: {
    expirationDate?: string;
    daysUntilExpiration?: number;
    documentCategory?: string;
  };
}

export const NotificationsBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation('ui-common');

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const userNotifications = await expirationIntelligence.getUserNotifications(user.id);
      setNotifications(userNotifications);
      
      // Count unread critical and warning notifications
      const unread = userNotifications.filter(
        (n: Notification) => !n.is_read && (n.severity === 'critical' || n.severity === 'warning')
      );
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
     
    if (user?.id) {
      fetchNotifications();
      // Set up periodic refresh every 5 minutes
      const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user?.id, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
     
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await expirationIntelligence.markNotificationAsRead(notification.id);
      await fetchNotifications();
    }

    // Navigate to document if available
    if (notification.document_id) {
      navigate(`/documents/${notification.document_id}`);
      setShowDropdown(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityBadgeVariant = (severity: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t('notifications.justNow', 'Just now');
    if (diffInHours < 24) return t('notifications.hoursAgo', { hours: diffInHours });
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return t('notifications.yesterday', 'Yesterday');
    return t('notifications.daysAgo', { days: diffInDays });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 rounded-lg border bg-popover p-0 shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h4 className="text-sm font-semibold">
              {t('notifications.title', 'Notifications')}
            </h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowDropdown(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">
                  {t('notifications.loading', 'Loading notifications...')}
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {t('notifications.empty', 'No notifications')}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "w-full px-4 py-3 text-left transition-colors hover:bg-muted/50",
                      !notification.is_read && "bg-muted/20"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getSeverityIcon(notification.severity)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium leading-none">
                            {notification.title}
                          </p>
                          <Badge variant={getSeverityBadgeVariant(notification.severity)}>
                            {notification.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {notifications.length > 0 && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  navigate('/notifications');
                  setShowDropdown(false);
                }}
              >
                {t('notifications.viewAll', 'View all notifications')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
