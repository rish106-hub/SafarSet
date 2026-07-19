import { getCurrentUser } from "@/application/dal/auth";
import { parseItineraryText } from "@/features/trips/itinerary-parser";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

async function textFromPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false, useSystemFonts: true }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= Math.min(document.numPages, 12); pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
  }
  return pages.join("\n");
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  let text = String(form.get("text") ?? "");
  if (file instanceof File) {
    if (file.size > MAX_FILE_BYTES) return Response.json({ error: "File is larger than 5 MB." }, { status: 413 });
    if (!["application/pdf", "text/plain", "text/calendar"].includes(file.type) && !/\.(pdf|txt|ics)$/i.test(file.name)) return Response.json({ error: "Use an ICS, TXT, or PDF itinerary." }, { status: 415 });
    try { text = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf") ? await textFromPdf(file) : await file.text(); } catch { return Response.json({ error: "This file has no readable itinerary text. Scanned PDFs are not supported yet." }, { status: 422 }); }
  }
  if (!text.trim()) return Response.json({ error: "No itinerary text was found." }, { status: 422 });
  return Response.json(parseItineraryText(text), { headers: { "cache-control": "private, no-store" } });
}
