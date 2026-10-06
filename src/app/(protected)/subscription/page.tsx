"use client";

import { useEffect, useState } from "react";
import { Alert, Tabs } from "antd";
import { AppPayments } from "@/components/AppPayments";
import { AppMyPlans } from "@/components/AppMyPlans";
import { AppNewPlans } from "@/components/AppNewPlans";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { hasStaffAccess } from "@/util/roles";
import { FullPageLoading } from "@/ui/loading/full-page-loading";

const UserProfile = () => {
    const { user, loading, allowed } = useAuthGuard();
    const [activeTab, setActiveTab] = useState("1");
    useEffect(() => { if (new URLSearchParams(window.location.search).has("campaign")) setActiveTab("3"); }, []);
    if (loading) return <FullPageLoading />;
    if (!allowed) return null;
    if (hasStaffAccess(user)) return <Alert style={{ margin: 24 }} type="info" showIcon
        message="Seu acesso não depende de assinatura"
        description="Administradores e colaboradores têm acesso à plataforma pelo seu tipo de usuário." />;

    const items = [
        {
            key: "1",
            label: `Minhas Assinaturas`,
            children: <AppMyPlans />,
        },
        {
            key: "2",
            label: `Pagamentos`,
            children: <AppPayments />,
        },
        {
            key: "3",
            label: `Planos`,
            children: <AppNewPlans />,
        },
    ];

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
            className="subscription-page"
        >
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={items}
                style={{ width: "100%", maxWidth: "1300px", padding: "20px" }}
                tabBarStyle={{ fontSize: "20px", fontWeight: 600 }}
            />
        </div>
    );
};

export default UserProfile;
