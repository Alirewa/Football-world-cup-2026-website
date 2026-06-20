// Root layout — only reachable when middleware is absent (static export build).
// In the normal server build, middleware rewrites "/" to "/fa" before this
// segment is ever matched, so this stays dead code there.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
