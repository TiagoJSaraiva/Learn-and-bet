"use client";

import { useAuth } from "@/app/components/AuthProvider";

export function MoneyChoiceModal() {
  const { moneyChoice, resolveMoneyChoice } = useAuth();

  if (!moneyChoice) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-zinc-900">
          Qual saldo deseja manter?
        </h2>
        <p className="mt-3 text-sm text-zinc-600">
          Encontramos dinheiro salvo localmente e na sua conta. Escolha qual saldo
          deve permanecer na sessão.
        </p>
        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={() => resolveMoneyChoice("account")}
            className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
          >
            Usar saldo da conta (${moneyChoice.accountMoney})
          </button>
          <button
            type="button"
            onClick={() => resolveMoneyChoice("local")}
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700"
          >
            Usar saldo local (${moneyChoice.localMoney})
          </button>
        </div>
      </div>
    </div>
  );
}