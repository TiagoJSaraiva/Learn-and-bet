import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-24">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <span className="w-fit rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Learn &amp; Bet
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-zinc-900 sm:text-5xl">
              Quizzes educacionais gamificados para acelerar o aprendizado.
            </h1>
            <p className="text-lg leading-relaxed text-zinc-600">
              Escolha um tema, responda 20 perguntas e ganhe recompensas com base no
              seu desempenho. Tudo pensado para sessões rápidas, claras e divertidas.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/quizzes"
                className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Explorar quizzes
              </Link>
              <span className="rounded-full border border-zinc-200 px-6 py-3 text-sm text-zinc-500">
                MVP focado em velocidade e clareza
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-6 rounded-3xl border border-zinc-200 bg-white/80 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-zinc-900">Como funciona</h2>
            <ul className="space-y-4 text-sm text-zinc-600">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                Sessões com 20 perguntas sorteadas a cada início.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                Tempo limite individual por questão e feedback imediato.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                Economia local simples para equilibrar desafios e recompensas.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
