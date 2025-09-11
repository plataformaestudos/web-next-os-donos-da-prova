"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/user.context";
import { HomeContent } from "@/ui/home/home.component";

export default function HomePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  useEffect(() => {
    console.log("Checking user authentication status in HomePage:", user);
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user,loading, router]);

  if (loading || !user?.profile) return <div>Carregando...</div>;

  return (
    <main style={{ padding: 24 }}>
      <HomeContent userProfile={user.profile} />
    </main>
  );
}
