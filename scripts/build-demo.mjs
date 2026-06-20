// Builds the static GitHub Pages demo: no API routes, no middleware, no DB/Redis.
// `output: 'export'` does not support route handlers or middleware, so both are
// moved aside for the duration of the build and restored afterwards (even on failure).

import { existsSync, renameSync, cpSync, copyFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const MOVES = [
  ['src/middleware.ts', 'src/middleware.ts.demobak'],
  ['src/app/api', 'src/app/_api.demobak'],
]

function apply(moves) {
  for (const [from, to] of moves) {
    if (existsSync(from)) renameSync(from, to)
  }
}

function revert(moves) {
  for (const [from, to] of moves) {
    if (existsSync(to)) renameSync(to, from)
  }
}

apply(MOVES)
try {
  execSync('next build', {
    stdio: 'inherit',
    env: { ...process.env, DEMO_EXPORT: 'true', NEXT_PUBLIC_DEMO_MODE: 'true' },
  })

  // The app's internal navigation (router.push('/auth/verify'), Link href="/profile", etc.)
  // omits the locale prefix — in the normal server build, next-intl's middleware rewrites
  // that transparently to /fa/... server-side. Static export has no middleware, so the
  // client router 404s on those un-prefixed paths. Mirror everything from out/fa/ up to
  // out/ root so both prefixed and un-prefixed paths resolve to the same static files.
  cpSync('out/fa', 'out', { recursive: true })
  copyFileSync('out/fa.html', 'out/index.html')
} finally {
  revert(MOVES)
}
