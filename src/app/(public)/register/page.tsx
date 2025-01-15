import { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Cadastrar",
};

export default function RegisterPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <RegisterForm />
    </main>
  );
}
