import "next-auth";

import { type User } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
      role: string;
    };
  }
}
