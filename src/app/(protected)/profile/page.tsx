import {
  Col,
  Row
} from "antd";

import { AppProfileCard } from "@/components/AppProfileCard";
import { getUser } from "@/util/user";

const UserProfile = async () => {
  const user = await getUser();

  if (!user) {
    return (
      <Row
        justify="center"
        style={{ marginTop: "50px" }}
      >
        <p>Nenhum usuário encontrado</p>
      </Row>
    );
  }

  return (
    <Row
      justify="center"
      style={{ width: "100%" }}
    >
      <Col
        xs={24}
        sm={16}
        md={12}
        lg={10}
      >
        <AppProfileCard user={user} />
      </Col>
    </Row>
  );
};

export default UserProfile;
