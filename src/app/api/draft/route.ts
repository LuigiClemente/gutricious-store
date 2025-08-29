import { draftMode } from "next/headers";

export const runtime = "edge";
import { RedirectType, redirect } from "next/navigation";

export async function GET() {
	(await draftMode()).enable();
	redirect("/", RedirectType.replace);
}
