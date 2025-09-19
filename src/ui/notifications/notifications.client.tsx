"use client";

import { useEffect, useState, useRef, useContext } from "react";
import { Badge, Popover, List, Spin, Empty, Button } from "antd";
import Image from "next/image";
import HttpClient from "@/util/http-client/fetch-client.util";
import { ResponseModel } from "@/model/common.model";
import { ThemeProvider } from "@/app/provider";
type Notification = {
    id: string;
    type: string;
    referenceId: string;
    isRead: boolean;
    createdAt: string;
    title?: string;
    body?: string;
    url?: string;
};

export default function NotificationsClient() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const pollingRef = useRef<number | null>(null);
    const { theme } = useContext(ThemeProvider);

    // o ideal seria essa função aqui estar em um server component
    async function fetchUnreadCount() {
        try {
            const resp = await HttpClient.fetch<ResponseModel<number>>(
                "/notifications/unread/count",
                { method: "GET" }
            );
            console.log("Unread count response:", resp);
            const count = typeof resp?.data === "number" ? resp.data : Number(resp?.data) || 0;
            console.log("Parsed unread count:", count);

            setUnreadCount(count);
        } catch (err) {
            console.error("Erro ao buscar contagem de notificações", err);
        }
    }

    async function fetchNotifications() {
        setLoading(true);
        try {
            const resp = await HttpClient.fetch<ResponseModel<Notification[]>>("/notifications", {
                method: "GET",
            });
            setNotifications(resp.data);
            console.log("Fetched notifications:", resp.data);
            setUnreadCount(resp.data.filter((n) => !n.isRead).length);
        } catch (err) {
            console.error("Erro ao buscar notificações", err);
        } finally {
            setLoading(false);
        }
    }

    async function markAsRead(notificationId: string) {
        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)));
        setUnreadCount((c) => Math.max(0, c - 1));
        try {
            await HttpClient.fetch(`/notifications/${notificationId}/read`, { method: "PATCH" });
        } catch (err) {
            console.error("Falha marcar como lido", err);
            await fetchNotifications();
            await fetchUnreadCount();
        }
    }

    async function markAllAsRead() {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        try {
            await HttpClient.fetch(`/notifications/read/all`, { method: "PATCH" });
        } catch (err) {
            console.error("Falha marcar todas como lidas", err);
            await fetchNotifications();
            await fetchUnreadCount();
        }
    }

    async function onPopoverOpenChange(open: boolean) {
        setPopoverOpen(open);
        if (open) {
            await fetchNotifications();
        }
    }

    useEffect(() => {
        fetchUnreadCount();

        // Optional: polling every 30s for new notifications
        // Uncomment if you want polling:
        /*
        pollingRef.current = window.setInterval(() => {
          fetchUnreadCount();
        }, 30000);
        */
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, []);

    const popoverContent = (
        <div style={{ width: 360, maxHeight: 420, overflow: "auto" }}>
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
                    <Spin />
                </div>
            ) : notifications.length === 0 ? (
                <Empty description="Sem notificações" />
            ) : (
                <List
                    itemLayout="horizontal"
                    dataSource={notifications}
                    renderItem={(item) => (
                        <List.Item
                            style={{
                                background: item.isRead ? undefined : "rgba(24,144,255,0.06)",
                                cursor: "pointer",
                                padding: "8px 12px",
                            }}
                            onClick={() => {
                                if (!item.isRead) markAsRead(item.id);
                                if (item.url) window.location.href = item.url;
                                else window.location.href = `/questions/${item.referenceId}`;
                                setPopoverOpen(false);
                            }}
                        >
                            <List.Item.Meta
                                title={item.title ?? `Notificação: ${item.type}`}
                                description={item.body ?? new Date(item.createdAt).toLocaleString()}
                            />
                        </List.Item>
                    )}
                />
            )}

            {notifications.length > 0 && (
                <div style={{ padding: 8, textAlign: "center" }}>
                    <Button type="link" onClick={markAllAsRead}>
                        Marcar todas como lidas
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <Popover
            content={popoverContent}
            trigger="click"
            placement="bottomRight"
            open={popoverOpen}
            onOpenChange={onPopoverOpenChange}
        >
            <Badge count={unreadCount} size="small" offset={[0, 0]}>
                <div style={{ display: "inline-block", cursor: "pointer" }}>
                    <Image src={theme === "dark" ? "/images/sino-b.png" : "/images/sino.png"} alt="Notificações" width={28} height={28} />
                </div>
            </Badge>
        </Popover>
    );
}
