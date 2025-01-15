import Link from "next/link";
import { auth } from "src/auth";
import { redirect } from "next/navigation";

export default async function IndexPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/home");
  }

  return (
    <main>
      <h1 className={` mb-4 text-xl md:text-2xl`}>Landing</h1>
      <Link href="/login">Login</Link>
    </main>
  );
}
