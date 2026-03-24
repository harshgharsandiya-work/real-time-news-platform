import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api, authHeaders } from "../lib/api";
import { useAuth } from "./AuthContext";

interface NotificationContextType {
    unreadCount: number;
    notifications: any[];
    loading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined,
);

export const NotificationProvider = () => {
    const { jwtToken } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>();

    useEffect(() => {
        if (!jwtToken) return;

        const fetch = async () => {
            try {
                const res = await api.get("/notifications/inbox", {
                    headers: authHeaders(jwtToken),
                });

                setNotifications(res.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [jwtToken]);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const markAsRead = async (notificationId: string) => {
        try {
            setLoading(true);
            await api.patch(`/notifications/read/${notificationId}`, {
                headers: authHeaders(jwtToken),
            });

            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, isRead: true } : n,
                ),
            );
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const markAsAllRead = async () => {
        try {
            setLoading(true);
            await api.patch(`/notifications/read/all`, {
                headers: authHeaders(jwtToken),
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
};
