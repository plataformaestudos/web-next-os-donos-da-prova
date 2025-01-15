import Credentials from "next-auth/providers/credentials";
import NextAuth from "next-auth";

const users = [
  {
    id: "1",
    role: "admin",
    name: "Admin",
    email: "admin@email.com",
    password: "123456",
  },
  {
    id: "2",
    role: "collaborator",
    name: "Colaborador",
    email: "colaborador@email.com",
    password: "123456",
  },
  {
    id: "3",
    role: "student",
    name: "Estudante",
    email: "estudante@email.com",
    password: "123456",
  },
];

const publicRoutes = ["/", "/cadastro"];

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  callbacks: {
    authorized: async ({ auth, request: { nextUrl } }) => {
      const isLoggedIn = !!auth?.user;

      if (isLoggedIn || publicRoutes.includes(nextUrl.pathname)) {
        if (nextUrl.pathname === "/login" || nextUrl.pathname === "/cadastro")
          return Response.redirect(new URL("/", nextUrl));
        return true;
      } else {
        return false;
      }
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as unknown as { role: string }).role = token.role as string;
      return session;
    },
  },
  session: {
    strategy: "jwt",
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
