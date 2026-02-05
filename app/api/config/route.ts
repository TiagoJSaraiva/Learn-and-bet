import { NextResponse } from "next/server";

import { initialMoneyFallback } from "@/lib/server/config";
import { difficultyConfig } from "@/lib/server/difficulties";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    initialMoney: initialMoneyFallback,
    difficulties: difficultyConfig,
  });
}
