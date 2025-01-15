import Link from "next/link";
import { auth } from "src/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main>
      <h1 className={` mb-4 text-xl md:text-2xl`}>Home</h1>
      <p>{session?.user?.name}</p>
      <div className="flex flex-col">
        {session?.user?.role === "admin" && (
          <>
            <Link href="/exams/new">Cadastrar concurso</Link>
            <Link href="/modules">Módulos</Link>
          </>
        )}
        {session?.user?.role === "admin" ||
          (session?.user?.role === "collaborator" && (
            <Link href="/questions/new">Cadastrar questão</Link>
          ))}
      </div>
    </main>
  );
}
