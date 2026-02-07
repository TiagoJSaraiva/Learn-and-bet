"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabaseBrowserClient } from "@/lib/supabase/client";

const moneyStorageKey = "learn-bet.money";
const defaultMoney = 200;

type Profile = {
  id: string;
  name: string | null;
  nickname: string | null;
  money: number;
  quizzes_done_amount: number;
};

type MoneyChoice = {
  localMoney: number;
  accountMoney: number;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  money: number | null;
  loading: boolean;
  moneyChoice: MoneyChoice | null;
  updateMoney: (value: number) => Promise<void>;
  incrementQuizzesDone: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resolveMoneyChoice: (choice: "local" | "account") => Promise<void>;
  clearMoneyChoice: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getStoredMoney = () => {
  if (typeof window === "undefined") return defaultMoney;
  const stored = window.localStorage.getItem(moneyStorageKey);
  if (!stored) return defaultMoney;
  const parsed = Number(stored);
  return Number.isNaN(parsed) ? defaultMoney : parsed;
};

const setStoredMoney = (value: number) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(moneyStorageKey, value.toString());
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [money, setMoney] = useState<number | null>(null);
  const [moneyChoice, setMoneyChoice] = useState<MoneyChoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);
  const [shouldPromptMoneyChoice, setShouldPromptMoneyChoice] = useState(false);
  const [localMoneySnapshot, setLocalMoneySnapshot] = useState<number>(defaultMoney);

  const supabase = useMemo(() => supabaseBrowserClient, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, nickname, money, quizzes_done_amount")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    }
  }, [supabase, user]);

  const updateMoney = useCallback(
    async (value: number) => {
      setMoney(value);
      setStoredMoney(value);
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ money: value, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (!error) {
        setProfile((prev) => (prev ? { ...prev, money: value } : prev));
      }
    },
    [supabase, user]
  );

  const incrementQuizzesDone = useCallback(async () => {
    if (!user) return;
    const currentCount = profile?.quizzes_done_amount ?? 0;
    const { error } = await supabase
      .from("profiles")
      .update({
        quizzes_done_amount: currentCount + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (!error) {
      setProfile((prev) =>
        prev
          ? { ...prev, quizzes_done_amount: prev.quizzes_done_amount + 1 }
          : prev
      );
    }
  }, [profile?.quizzes_done_amount, supabase, user]);

  const resolveMoneyChoice = useCallback(
    async (choice: "local" | "account") => {
      if (!moneyChoice) return;
      const chosenValue =
        choice === "account" ? moneyChoice.accountMoney : moneyChoice.localMoney;
      await updateMoney(chosenValue);
      setMoneyChoice(null);
    },
    [moneyChoice, updateMoney]
  );

  const clearMoneyChoice = useCallback(() => {
    setMoneyChoice(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
      setInitialAuthChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (event === "SIGNED_IN") {
        const currentLocal = getStoredMoney();
        setLocalMoneySnapshot(currentLocal);
        setShouldPromptMoneyChoice(true);
      }

      if (event === "SIGNED_OUT") {
        setShouldPromptMoneyChoice(false);
        setMoneyChoice(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const storedMoney = getStoredMoney();
    setMoney(storedMoney);
  }, []);

  useEffect(() => {
    if (!user && initialAuthChecked) {
      setProfile(null);
      setMoney(defaultMoney);
      setStoredMoney(defaultMoney);
      return;
    }
    refreshProfile();
  }, [user, refreshProfile, initialAuthChecked]);

  useEffect(() => {
    if (!user || !profile) return;

    if (shouldPromptMoneyChoice) {
      if (localMoneySnapshot > defaultMoney) {
        if (localMoneySnapshot === profile.money) {
          setShouldPromptMoneyChoice(false);
          return;
        }
        setMoneyChoice({
          localMoney: localMoneySnapshot,
          accountMoney: profile.money,
        });
        setShouldPromptMoneyChoice(false);
        return;
      }

      setShouldPromptMoneyChoice(false);
    }

    // Default behavior: use account money after login.
    setMoney(profile.money);
    setStoredMoney(profile.money);
  }, [
    user,
    profile,
    shouldPromptMoneyChoice,
    localMoneySnapshot,
  ]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      money,
      loading,
      moneyChoice,
      updateMoney,
      incrementQuizzesDone,
      refreshProfile,
      resolveMoneyChoice,
      clearMoneyChoice,
    }),
    [
      user,
      session,
      profile,
      money,
      loading,
      moneyChoice,
      updateMoney,
      incrementQuizzesDone,
      refreshProfile,
      resolveMoneyChoice,
      clearMoneyChoice,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};