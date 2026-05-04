interface ViewTransition {
  finished: Promise<void>
  ready: Promise<void>
  updateCallbackDone: Promise<void>
  skipTransition(): void
}

declare global {
  interface Document {
    startViewTransition?(callback: () => void | Promise<void>): ViewTransition
  }
}

export {}
