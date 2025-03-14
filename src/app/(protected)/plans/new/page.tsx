import { Button } from "antd";
import { PageLayout } from "@/ui/page-layout/page-layout.component";

export default async function NewPlanPage() {
  return (
    <PageLayout
      title="Novo plano"
      backHref="/plans"
      actions={[
        <Button key="save" type="primary" size="large">
          Salvar
        </Button>,
      ]}
    >
      novo plano
    </PageLayout>
  );
}
