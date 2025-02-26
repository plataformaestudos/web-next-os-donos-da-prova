import { Button, Divider, Flex } from "antd";
import { PropsWithChildren, ReactNode } from "react";

import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import Title from "antd/es/typography/Title";

interface PageLayoutProps {
  title: string;
  actions: ReactNode[];
  backHref?: string;
}

export function PageLayout(props: PropsWithChildren<PageLayoutProps>) {
  return (
    <Flex vertical style={{ flex: 1, padding: "16px 32px" }}>
      <Flex justify="space-between" align="center">
        <Flex align="center" gap={16}>
          {props.backHref && (
            <Link href={props.backHref}>
              <Button shape="circle" icon={<LuArrowLeft />} />
            </Link>
          )}
          <Title style={{ margin: 0 }} level={2}>
            {props.title}
          </Title>
        </Flex>
        <Flex gap={16} align="center">
          {props.actions}
        </Flex>
      </Flex>
      <Divider />
      <div>{props.children}</div>
    </Flex>
  );
}
