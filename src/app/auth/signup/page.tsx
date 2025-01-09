import { Metadata } from "next";
import SignupForm from "./signup-form";

export const metadata: Metadata = {
  title: "Signup",
};

export default function SignupPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <SignupForm />
    </main>
  );
}
