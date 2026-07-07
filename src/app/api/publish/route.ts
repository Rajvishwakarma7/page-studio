import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { publishPageSnapshot } from "@/lib/publish/releases";
import { validatePage } from "@/lib/schema/pageSchema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (user?.role !== "publisher") {
    return NextResponse.json(
      { error: "Only publishers can publish releases." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as unknown;
  const pageResult = validatePage(body);

  if (!pageResult.success) {
    return NextResponse.json(
      {
        error: "Invalid draft page.",
        details: pageResult.error.flatten(),
      },
      { status: 400 },
    );
  }

  const result = await publishPageSnapshot(pageResult.data);

  return NextResponse.json(result);
}
