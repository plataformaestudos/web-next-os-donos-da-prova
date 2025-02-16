import { Button, Dropdown, Flex } from "antd";
import {
  EditOutlined,
  EllipsisOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMemo, useState } from "react";

import { DeleteModuleButton } from "./delete/delete-module-button.component";
import { ItemType } from "antd/es/menu/interface";
import Link from "next/link";
import Title from "antd/es/typography/Title";
import { UnlinkModuleButton } from "./delete/unlink-module-button.component";
import { useCreateModule } from "./create/create-module.context";

export function ModuleTitle({
  id,
  title,
  parentModuleId,
}: {
  id: string;
  title: string;
  parentModuleId?: string;
}) {
  const { openCreateModal } = useCreateModule();
  const [menuOpened, setMenuOpened] = useState(false);

  const items = useMemo(() => {
    const result: ItemType[] = [
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
    ];

    if (parentModuleId) {
      result.splice(3, 0, {
        key: "unlink",
        style: {
          padding: 0,
        },
        disabled: true,
        label: (
          <UnlinkModuleButton
            moduleId={id}
            parentModuleId={parentModuleId}
            onUnlink={() => setMenuOpened(false)}
          />
        ),
      });
    }
    return result;
  }, [id, title, parentModuleId, openCreateModal]);

  return (
    <Flex justify="space-between" align="center">
      <Title level={5} style={{ margin: 0 }}>
        {title}
      </Title>
      <Dropdown
        open={menuOpened}
        onOpenChange={setMenuOpened}
        menu={{
          items,
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
