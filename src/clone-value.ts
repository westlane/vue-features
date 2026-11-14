/** Deep-clone for launch/host snapshots. Falls back when structuredClone rejects. */
export function cloneValue<T>(value: T): T {
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value)) as T
  }
}
