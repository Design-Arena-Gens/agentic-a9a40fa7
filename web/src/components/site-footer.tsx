export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-emerald-900/10 bg-emerald-50/80 py-8 text-sm text-emerald-700 dark:border-emerald-200/20 dark:bg-emerald-950/60 dark:text-emerald-200/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} Spotify Dropship BD. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href="#"
            className="transition hover:text-emerald-500 dark:hover:text-emerald-100"
          >
            Terms
          </a>
          <a
            href="#"
            className="transition hover:text-emerald-500 dark:hover:text-emerald-100"
          >
            Privacy
          </a>
          <a
            href="mailto:ops@spotifydropship.bd"
            className="transition hover:text-emerald-500 dark:hover:text-emerald-100"
          >
            ops@spotifydropship.bd
          </a>
        </div>
      </div>
    </footer>
  );
}
