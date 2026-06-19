/** Raised when a document cannot be parsed or rebuilt. */
export class DocumentProcessingError extends Error {
  readonly format?: string;

  constructor(message: string, format?: string) {
    super(message);
    this.name = "DocumentProcessingError";
    this.format = format;
  }
}