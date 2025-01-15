import Link from "next/link";

export default async function IndexPage() {
  const data = await fetch("http://localhost:3001/exams");
  const concursos = await data.json();

  return (
    <main>
      <h1 className={` mb-4 text-xl md:text-2xl`}>Concursos</h1>
      <ul>
        {concursos.map((concurso: { id: number; nome: string }) => (
          <li key={concurso.id}>
            <Link href={`/concursos/${concurso.id}`}>{concurso.nome}</Link>
          </li>
        ))}
      </ul>
      <Link href="/concursos/novo">Novo concurso</Link>
    </main>
  );
}
