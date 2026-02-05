import { NextResponse } from "next/server";

import { quizById } from "@/lib/server/quizzes";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const quiz = quizById(id);

  if (!quiz) {
    return NextResponse.json({ error: "Quiz não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ quiz });
}
