declare module 'pdf-parse' {
  interface PDFParseOptions {
    pagerender?: any;
  }

  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
    text?: string;
  }

  function pdfParse(
    dataBuffer: Buffer,
    options?: PDFParseOptions
  ): Promise<PDFParseResult>;

  export = pdfParse;
}
