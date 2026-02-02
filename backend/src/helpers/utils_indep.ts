function getNthOccurrenceIndex(str: string, char: string, n: number): number {
  if (n < 1) {
    return -1;
  }

  for (let i = 0; i < str.length; i++) {
    if (str[i] == char) n--;
    if (n < 1) return i;
  }

  return -1;
}

function dockerizeDatabaseUrl(databaseUrl: string): string {
  const indexOfAt = databaseUrl.indexOf("@");
  const indexOf3rdSlash = getNthOccurrenceIndex(databaseUrl, "/", 3);

  return `${databaseUrl.substring(
    0,
    indexOfAt + 1
  )}postgres${databaseUrl.substring(indexOf3rdSlash)}`;
}

export function fixDatabaseUrl(): void {
  if (process.env.IS_IN_DOCKER && process.env.DATABASE_URL) {
    process.env.DATABASE_URL = dockerizeDatabaseUrl(process.env.DATABASE_URL);
  }
}
