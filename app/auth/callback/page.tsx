"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Popup } from "@/app/components/Popup";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/app/components/AuthProvider";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateMoney } = useAuth();
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  useEffect(() => {
    const finalize = async () => {
      const type = searchParams.get("type");
      const { data } = await supabaseBrowserClient.auth.getSession();
      const session = data.session;

      if (!session) {
        setPopupMessage("Não foi possível validar o link. Tente novamente.");
        return;
      }

      if (type === "signup") {
        const name =
          (session.user.user_metadata?.name as string | undefined) ??
          session.user.email ??
          "Usuário";

        await supabaseBrowserClient
          .from("profiles")
          .update({ name, money: 200, updated_at: new Date().toISOString() })
          .eq("id", session.user.id);

        await updateMoney(200);
      }

      router.replace("/");
    };

    finalize();
  }, [router, searchParams, updateMoney]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Popup
        message={popupMessage ?? ""}
        visible={Boolean(popupMessage)}
        onClose={() => setPopupMessage(null)}
      />
      <main className="mx-auto flex min-h-screen max-w-lg items-center px-6">
        <div className="w-full rounded-3xl border border-zinc-200 bg-white p-8 text-sm text-zinc-600 shadow-sm">
          Validando sua conta... aguarde.
        </div>
      </main>
    </div>
  );
}