import * as pdfjsLib from 'pdfjs-dist';

// Set up worker source from reliable CDN matching installed version
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export interface ExtractedPdfResult {
  text: string;
  pageCount: number;
  base64: string;
  filename: string;
  size: number;
}

/**
 * Extracts plain text content and base64 encoding from an uploaded PDF file
 */
export async function extractPdfDocument(file: File): Promise<ExtractedPdfResult> {
  const arrayBuffer = await file.arrayBuffer();

  // Convert arrayBuffer to base64 for Gemini multimodal document transmission
  let binary = '';
  const bytes = new Uint8Array(arrayBuffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    let fullText = '';

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: unknown) => {
          if (typeof item === 'object' && item !== null && 'str' in item && typeof (item as { str: unknown }).str === 'string') {
            return (item as { str: string }).str;
          }
          return '';
        })
        .join(' ');

      if (pageText.trim()) {
        fullText += `--- [Page ${pageNum} of ${pageCount}] ---\n${pageText}\n\n`;
      }
    }

    return {
      text: fullText.trim(),
      pageCount,
      base64,
      filename: file.name,
      size: file.size,
    };
  } catch (err) {
    console.warn('[PDF Extractor] Error parsing PDF text layer:', err);
    // Even if text layer is encrypted or rasterized scan, we still have the base64 for Gemini vision
    return {
      text: `[Uploaded PDF: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\n(Scanned PDF document loaded for Gemini multimodal inspection)`,
      pageCount: 1,
      base64,
      filename: file.name,
      size: file.size,
    };
  }
}
