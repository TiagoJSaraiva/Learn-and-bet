import { NextResponse } from "next/server";

import { supabaseAdminClient } from "@/lib/supabase/admin";

type Payload = {
  nickname?: string;
};

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: userError } =
    await supabaseAdminClient.auth.getUser(token);

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Payload;
  const nickname = body.nickname?.trim() ?? "";

  if (!nickname || nickname.length > 20) {
    return NextResponse.json({ error: "Invalid nickname" }, { status: 400 });
  }

  const { data: existing } = await supabaseAdminClient
    .from("profiles")
    .select("id")
    .eq("nickname", nickname)
    .neq("id", userData.user.id)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "Nickname taken" }, { status: 409 });
  }

  const { error: updateError } = await supabaseAdminClient
    .from("profiles")
    .update({ nickname, updated_at: new Date().toISOString() })
    .eq("id", userData.user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}