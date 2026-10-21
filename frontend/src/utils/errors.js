export function parseApiError(error) {
  if (!error?.response) {
    return 'Cannot reach the server. Check that the backend is running.'
  }

  const { data, status } = error.response

  if (data && typeof data === 'object') {
    // Business errors from your backend: { message, status }
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message.replace(/\.{2,}\s*$/, '.')
    }
    // Validation errors arrive as { fieldName: "message", ... }
    if (typeof data.status !== 'number') {
      const messages = Object.values(data).filter((value) => typeof value === 'string')
      if (messages.length > 0) return messages.join(' ')
    }
  }

  if (status >= 500) return 'The server hit an unexpected error. Please try again.'
  return `Request failed (HTTP ${status}).`
}