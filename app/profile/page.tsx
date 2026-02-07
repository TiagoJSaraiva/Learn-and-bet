"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { ProfileClient } from "@/app/profile/ProfileClient";
import { useAuth } from "@/app/components/AuthProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, money, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const resolvedProfile = useMemo(() => {
    if (!user) {
      return { id: "", name: null, money: 0, quizzes_done_amount: 0 };
    }

    return {
      id: user.id,
      name: profile?.name ?? (user.user_metadata?.name as string | null) ?? null,
      nickname: profile?.nickname ?? null,
      money: profile?.money ?? money ?? 0,
      quizzes_done_amount: profile?.quizzes_done_amount ?? 0,
    };
  }, [user, profile, money]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <span className="text-sm text-zinc-500">Carregando perfil...</span>
      </div>
    );
  }

  return <ProfileClient userEmail={user.email ?? ""} profile={resolvedProfile} />;
}