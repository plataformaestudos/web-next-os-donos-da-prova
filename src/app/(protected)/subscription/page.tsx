import { Row, Tabs } from "antd";
import { createClient } from "@/util/supabase/server";
import { AppPayments } from "@/components/AppPayments";
import { AppMyPlans } from "@/components/AppMyPlans";
import { AppNewPlans } from "@/components/AppNewPlans";

const UserProfile = async () => {
  const supabase = await createClient();
  const { data: plans } = await supabase.from("subscription_plans").select("*");

  if (!plans) {
    return (
      <Row
        justify="center"
        style={{ marginTop: "50px" }}
      >
        <p>Nenhum usuário encontrado</p>
      </Row>
    );
  }

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
        defaultActiveKey="1"
        items={items}
        style={{ width: "100%", maxWidth: "1200px", padding: "20px" }}
      ></Tabs>
    </div>
  );
};

export default UserProfile;
