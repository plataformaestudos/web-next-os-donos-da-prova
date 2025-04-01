import { Button, Col, Divider, Flex, Row } from "antd";
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
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col span={24} sm={12}>
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
        </Col>
        <Col span={24} sm={12}>
          <Flex gap={16} align="center" justify="end" wrap>
            {props.actions}
          </Flex>
        </Col>
      </Row>
      <Divider />
      <div>{props.children}</div>
    </Flex>
  );
}
