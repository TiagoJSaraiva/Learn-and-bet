"use client";

import Link from "next/link";

import { useAuth } from "@/app/components/AuthProvider";

export function AuthLandingActions() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-wrap gap-4">
        <span className="rounded-full border border-zinc-200 px-6 py-3 text-sm text-zinc-500">
          Carregando...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      <Link
        href="/quizzes"
        className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
      >
        Explorar quizzes
      </Link>
      {!user ? (
        <>
          <Link
            href="/login"
            className="rounded-full border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            Criar conta
          </Link>
        </>
      ) : (
        <Link
          href="/profile"
          className="rounded-full border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
        >
          Perfil
        </Link>
      )}
    </div>
  );
}