export const offlineReadyStorageKey = 'cardioassist.offline-ready'

export function offlineReadyDismissed(raw: string | null): boolean {
  return raw === '1'
}

export function shouldShowOfflineReady(ready: boolean, raw: string | null): boolean {
  return ready && !offlineReadyDismissed(raw)
}
