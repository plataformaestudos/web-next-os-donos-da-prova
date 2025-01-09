import Credentials from "next-auth/providers/credentials";
import NextAuth from "next-auth";

const users = [
  {
    id: "1",
    name: "Admin",
    email: "admin@email.com",
    password: "123456",
  },
];

const publicRoutes = ["/auth/signup", "/landing"];

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized: async ({ auth, request: { nextUrl } }) => {
      const isLoggedIn = !!auth;

      if (isLoggedIn || publicRoutes.includes(nextUrl.pathname)) {
        if (nextUrl.pathname === "/auth/login")
          return Response.redirect(new URL("/", nextUrl));
        return true;
      } else {
        return false;
      }
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const user = users.find(
          (user) =>
            user.email === credentials.email &&
            user.password === credentials.password
        );

        if (!user) {
          // No user found, so this is their first attempt to login
          // Optionally, this is also the place you could do a user registration
          throw new Error("Invalid credentials.");
        }

        // return user object with their profile data
        return user;
      },
    }),
  ],
});
