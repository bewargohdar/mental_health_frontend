import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axios';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            const res = await api.get('/notifications');
            const data = res.data?.data?.data || res.data?.data || res.data || [];
            setNotifications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const res = await api.get('/notifications/unread-count');
            const count = res.data?.data?.count ?? res.data?.count ?? 0;
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, [isAuthenticated]);

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            await api.post(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all');
            setNotifications(prev =>
                prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    // Fetch on mount and when auth changes
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            fetchUnreadCount();

            // Poll for new notifications every 30 seconds
            const interval = setInterval(() => {
                fetchUnreadCount();
            }, 30000);

            return () => clearInterval(interval);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            fetchNotifications,
            fetchUnreadCount,
            markAsRead,
            markAllAsRead,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
