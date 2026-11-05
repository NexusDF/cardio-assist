import { nextTick, watch } from 'vue'
import type { Router } from 'vue-router'
import { tabMotion, type TabMotion } from '@/shared/navigation'

const motionMs = 280

export function installTabTransitions(router: Router): void {
  if (typeof document === 'undefined') return

  let animating = false

  router.beforeResolve((to, from) => {
    const motion = tabMotion(from.path, to.path)
    if (motion === 'tab-none' || animating) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    animating = true
    return new Promise<void>((resolve) => {
      const clear = () => {
        animating = false
        delete document.documentElement.dataset.tabMotion
      }
      const paint = () => renderNextView(router, resolve)

      if (!canStartViewTransition(document)) {
        const snapshot = captureSnapshot()
        paint()
          .then(() => playSnapshot(snapshot, motion))
          .finally(clear)
        return
      }

      document.documentElement.dataset.tabMotion = motion === 'tab-forward' ? 'forward' : 'back'
      try {
        const transition = document.startViewTransition(() => paint())
        transition.finished.then(clear, clear)
      } catch {
        clear()
        resolve()
      }
    })
  })
}

function renderNextView(router: Router, resolve: () => void): Promise<void> {
  return new Promise((done) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      stop()
      nextTick(() => done())
    }
    const stop = watch(() => router.currentRoute.value.path, finish)
    const timer = window.setTimeout(finish, 400)
    resolve()
  })
}

function canStartViewTransition(doc: Document): doc is Document & {
  startViewTransition: (update: () => void | Promise<void>) => { finished: Promise<void> }
} {
  return 'startViewTransition' in doc
}

function captureSnapshot(): HTMLElement | null {
  const content = document.getElementById('content')
  if (!content) return null
  const snapshot = content.cloneNode(true)
  if (!(snapshot instanceof HTMLElement)) return null
  snapshot.removeAttribute('id')
  snapshot.setAttribute('aria-hidden', 'true')
  snapshot.classList.add('tab-snapshot')
  content.after(snapshot)
  return snapshot
}

async function playSnapshot(snapshot: HTMLElement | null, motion: TabMotion): Promise<void> {
  const content = document.getElementById('content')
  if (!snapshot || !content) {
    snapshot?.remove()
    return
  }
  const direction = motion === 'tab-forward' ? 'forward' : 'back'
  snapshot.classList.add(`tab-snapshot-${direction}`)
  content.classList.add(`tab-enter-${direction}`)
  await nextFrame()
  snapshot.classList.add('is-gone')
  await wait(motionMs)
  snapshot.remove()
  content.classList.remove(`tab-enter-${direction}`)
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
