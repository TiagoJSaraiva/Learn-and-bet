import { NextResponse } from "next/server";

import { quizSummaries } from "@/lib/server/quizzes";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ quizzes: quizSummaries });
}
