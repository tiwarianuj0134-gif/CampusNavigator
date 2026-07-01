declare module 'pdf-parse' {
  interface PDFInfo {
    PDFFormatVersion: string;
    IsAcroFormPresent: boolean;
    IsXFAPresent: boolean;
    [key: string]: any;
  }
  interface PDFMetadata {
    [key: string]: any;
  }
  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: PDFMetadata;
    text: string;
    version: string;
  }
  function pdfParse(dataBuffer: Buffer, options?: object): Promise<PDFData>;
  export = pdfParse;
}
