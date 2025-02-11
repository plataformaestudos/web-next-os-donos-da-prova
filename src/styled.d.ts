import { GlobalToken } from "antd";
import "styled-components";

// and extend them!
declare module "styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends GlobalToken {}
}
