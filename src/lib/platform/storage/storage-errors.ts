export class StorageError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

export class StorageNotFoundError extends StorageError {
  constructor(key: string) {
    super(`Storage key not found: ${key}`);
    this.name = "StorageNotFoundError";
  }
}

export class StorageProviderNotConfiguredError extends StorageError {
  constructor(providerType: string) {
    super(
      `Storage provider "${providerType}" is not yet integrated. Set STORAGE_PROVIDER=local for local development.`,
    );
    this.name = "StorageProviderNotConfiguredError";
  }
}
