interface FetchLikeError {
  data?: { statusMessage?: string }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  const fetchError = error as FetchLikeError
  return fetchError?.data?.statusMessage ?? fallback
}
