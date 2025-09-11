"use client";

import Link from "next/link";
import { useUser } from "@/app/context/user.context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function IndexPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) router.push("/home"); 
      else router.push("/login");    
    }
  }, [user, loading, router]);

  if (!user) return <div>Carregando...</div>;

  return (
    <main>
      <h1>Landing</h1>
      <Link href="/login">Login</Link>
    </main>
  );
}
