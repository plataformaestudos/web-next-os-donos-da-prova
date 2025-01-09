import { auth, signOut } from "@/auth";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default async function LandingPage() {
  const session = await auth();

  return (
    <main>
      <h1 className={` mb-4 text-xl md:text-2xl`}>Landing</h1>
      {!session?.user ? (
        <Link
          href="/auth/login"
          className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
        >
          <span>Log in</span> <ArrowRightIcon className="w-5 md:w-6" />
        </Link>
      ) : (
        session.user.name
      )}
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
          <div className="hidden md:block">Sign Out</div>
        </button>
      </form>
    </main>
  );
}
