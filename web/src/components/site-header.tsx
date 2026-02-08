import Link from "next/link";

const navItems = [
  { href: "#catalog", label: "Catalog" },
  { href: "#playbook", label: "Fulfillment Playbook" },
  { href: "#partners", label: "Partners" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-emerald-50/80 backdrop-blur-md dark:border-emerald-200/20 dark:bg-emerald-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-emerald-800 dark:text-emerald-100">
          Spotify Dropship BD
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-emerald-700 md:flex dark:text-emerald-100/80">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition hover:text-emerald-500 dark:hover:text-emerald-200"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="hidden rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 md:inline-flex"
        >
          Talk to ops
        </a>
      </div>
    </header>
  );
}
