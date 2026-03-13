import mammoth from "mammoth";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

export async function parseFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "txt":
    case "md":
      return file.text();

    case "docx":
      return parseDocx(file);

    case "pdf":
      return parsePdf(file);

    default:
      throw new Error(`Unsupported file type: .${ext}`);
  }
}

async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function parsePdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .filter((item): item is TextItem => "str" in item)
        .map((item) => item.str)
        .join(" ")
    );
  }
  return pages.join("\n\n");
}
