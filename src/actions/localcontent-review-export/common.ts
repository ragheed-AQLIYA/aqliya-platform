export interface ReviewExportResult {
  success: boolean;
  data?: {
    filename: string;
    contentType: string;
    base64: string;
  };
  error?: string;
}
