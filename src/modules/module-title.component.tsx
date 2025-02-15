import { Button, Dropdown, Flex } from "antd";
import {
  EditOutlined,
  EllipsisOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import { DeleteModuleButton } from "./delete/delete-module-button.component";
import Link from "next/link";
import Title from "antd/es/typography/Title";
import { useCreateModule } from "./create/create-module.context";
import { useState } from "react";

export function ModuleTitle({ id, title }: { id: string; title: string }) {
  const { openCreateModal } = useCreateModule();
  const [menuOpened, setMenuOpened] = useState(false);

  return (
    <Flex justify="space-between" align="center">
      <Title level={5} style={{ margin: 0 }}>
        {title}
      </Title>
      <Dropdown
        open={menuOpened}
        onOpenChange={setMenuOpened}
        menu={{
          items: [
            {
              key: "create",
              icon: <PlusOutlined />,
              label: "Criar módulo filho",
              onClick: () => openCreateModal({ id, name: title }),
            },
            {
              key: "edit",
              icon: <EditOutlined />,
              label: <Link href={`/modules/${id}`}>Editar</Link>,
            },
            {
              type: "divider",
            },
            {
              key: "delete",
              style: {
                padding: 0,
              },
              disabled: true,
              label: (
                <DeleteModuleButton
                  moduleId={id}
                  onDelete={() => setMenuOpened(false)}
                />
              ),
            },
          ],
        }}
        trigger={["click"]}
      >
        <span>
          <Button size="small" icon={<EllipsisOutlined />} />
        </span>
      </Dropdown>
    </Flex>
  );
}
