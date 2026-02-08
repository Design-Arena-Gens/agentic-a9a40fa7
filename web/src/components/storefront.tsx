"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Product, ProductCategory, categories } from "@/data/products";

const BDT_TO_USD = 0.0091;

const formatPrice = (price: number, currency: "USD" | "BDT") =>
  new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(price);

type SortOption = "recommended" | "price-asc" | "price-desc" | "fulfillment";

type Filters = {
  search: string;
  category: ProductCategory | "All";
  currency: "Any" | "USD" | "BDT";
  maxPrice: number;
  sort: SortOption;
};

const DEFAULT_FILTERS: Filters = {
  search: "",
  category: "All",
  currency: "Any",
  maxPrice: 3000,
  sort: "recommended",
};

const IconCart = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 4h2l2 13h10l2-9H7" />
    <circle cx="9" cy="19" r="1.5" />
    <circle cx="17" cy="19" r="1.5" />
  </svg>
);

const IconLocation = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 21s6-5.686 6-11a6 6 0 1 0-12 0c0 5.314 6 11 6 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const IconClock = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4l3 2" />
  </svg>
);

const IconSpark = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M4 12h4" />
    <path d="M16 12h4" />
    <path d="m5.6 5.6 2.8 2.8" />
    <path d="m15.6 15.6 2.8 2.8" />
    <path d="m5.6 18.4 2.8-2.8" />
    <path d="m15.6 8.4 2.8-2.8" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

const IconArrow = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m5 12 5 5L20 7" />
  </svg>
);

const calcUsd = (product: Product) =>
  product.currency === "USD" ? product.price : product.price * BDT_TO_USD;

const SORTERS: Record<SortOption, (a: Product, b: Product) => number> = {
  recommended: (a, b) => b.popularity - a.popularity,
  "price-asc": (a, b) => calcUsd(a) - calcUsd(b),
  "price-desc": (a, b) => calcUsd(b) - calcUsd(a),
  fulfillment: (a, b) => {
    const parseHours = (time: string) => {
      const match = time.match(/(\d+)(?:-(\d+))?\s*(hour|day)/i);
      if (!match) return Number.POSITIVE_INFINITY;
      const min = Number.parseInt(match[1] ?? "0", 10);
      const max = Number.parseInt(match[2] ?? match[1] ?? "0", 10);
      const unit = match[3]?.toLowerCase() ?? "hour";
      const avg = (min + max) / 2;
      return unit.startsWith("day") ? avg * 24 : avg;
    };

    return parseHours(a.fulfillmentTime) - parseHours(b.fulfillmentTime);
  },
};

type StorefrontProps = {
  items: Product[];
};

export function Storefront({ items }: StorefrontProps) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  };

  const filteredProducts = useMemo(() => {
    return items
      .filter((product) => {
        const matchesCategory =
          filters.category === "All" || product.category === filters.category;
        const matchesCurrency =
          filters.currency === "Any" || product.currency === filters.currency;
        const matchesPrice = calcUsd(product) <= filters.maxPrice;
        const normalizedSearch = filters.search.trim().toLowerCase();
        const matchesSearch =
          normalizedSearch.length === 0 ||
          [product.name, product.description, product.badges?.join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch);

        return matchesCategory && matchesCurrency && matchesPrice && matchesSearch;
      })
      .sort(SORTERS[filters.sort]);
  }, [items, filters]);

  const selections = useMemo(() => {
    return items.filter((product) => selectedProducts.includes(product.id));
  }, [items, selectedProducts]);

  const estimatedUsd = selections.reduce(
    (total, product) => total + calcUsd(product),
    0,
  );
  const estimatedBdt = selections.reduce(
    (total, product) =>
      total + (product.currency === "BDT" ? product.price : product.price / BDT_TO_USD),
    0,
  );

  return (
    <div className="space-y-16">
      <section
        id="catalog"
        className="rounded-3xl border border-emerald-900/20 bg-white/80 p-6 shadow-sm shadow-emerald-900/5 backdrop-blur-sm dark:border-emerald-200/10 dark:bg-emerald-950/40"
      >
        <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-center">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100">
              <IconSpark className="h-4 w-4" />
              Spotify-first Bangladesh dropship partner
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-emerald-100 md:text-5xl">
              Launch and scale your Spotify storefront with Bangladeshi fulfillment.
            </h1>
            <p className="text-lg text-slate-600 dark:text-emerald-200/80">
              We aggregate premium accounts, marketing kits, and merch ready to ship
              worldwide from our Dhaka and Chattogram hubs. Build margin-rich bundles,
              automate renewals, and expand your catalog in days instead of months.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  setSelectedProducts(items.map((product) => product.id))
                }
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                <IconCart className="h-4 w-4" />
                Add full catalog
              </button>
              <button
                type="button"
                onClick={() => setSelectedProducts([])}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-600 hover:text-emerald-600 dark:border-emerald-400/40 dark:text-emerald-100"
              >
                Clear selection
              </button>
            </div>
          </div>
          <div className="grid gap-4 rounded-2xl border border-emerald-800/10 bg-emerald-50/60 p-6 text-slate-900 shadow-inner dark:border-emerald-300/20 dark:bg-emerald-900/60 dark:text-emerald-50">
            <div className="flex items-center gap-3">
              <IconLocation className="h-10 w-10 text-emerald-600 dark:text-emerald-300" />
              <div>
                <p className="text-sm uppercase tracking-wide text-emerald-600/80 dark:text-emerald-200/80">
                  Fulfillment hubs
                </p>
                <h2 className="text-lg font-semibold">
                  Dhaka • Chattogram • Global Carrier Network
                </h2>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-emerald-100/90">
              <li>• 24h premium credential provisioning</li>
              <li>• Export-ready merchandising with HS codes</li>
              <li>• Courier partnerships with paperless customs support</li>
            </ul>
            <p className="rounded-xl bg-white/70 px-4 py-3 text-sm font-medium text-emerald-900 shadow-sm dark:bg-emerald-800/80 dark:text-emerald-50">
              Ask our team for localized storefront copy, VAT advisory, and reseller
              agreements tailored for Bangladesh-based operators.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-sm dark:border-emerald-100/10 dark:bg-emerald-950/40 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm dark:border-emerald-400/10 dark:bg-emerald-950/60 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                placeholder="Search catalog…"
                className="w-full rounded-full border border-slate-200/60 bg-white px-4 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-emerald-500/30 dark:bg-emerald-950/80 dark:text-emerald-50 md:w-72"
                value={filters.search}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, search: event.target.value }))
                }
              />
              <select
                className="rounded-full border border-slate-200/60 bg-white px-4 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-emerald-500/30 dark:bg-emerald-950/80 dark:text-emerald-50"
                value={filters.category}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    category: event.target.value as Filters["category"],
                  }))
                }
              >
                <option value="All">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                className="rounded-full border border-slate-200/60 bg-white px-4 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-emerald-500/30 dark:bg-emerald-950/80 dark:text-emerald-50"
                value={filters.currency}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    currency: event.target.value as Filters["currency"],
                  }))
                }
              >
                <option value="Any">Any currency</option>
                <option value="USD">USD denominated</option>
                <option value="BDT">BDT denominated</option>
              </select>
              <select
                className="rounded-full border border-slate-200/60 bg-white px-4 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-emerald-500/30 dark:bg-emerald-950/80 dark:text-emerald-50"
                value={filters.sort}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    sort: event.target.value as Filters["sort"],
                  }))
                }
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="fulfillment">Fulfillment speed</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-emerald-100 md:items-end">
              <label htmlFor="max-price" className="font-medium">
                Cap budget (USD equivalent)
              </label>
              <input
                id="max-price"
                type="range"
                min={200}
                max={3000}
                step={50}
                value={filters.maxPrice}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxPrice: Number.parseInt(event.target.value, 10),
                  }))
                }
                className="w-full md:w-64"
              />
              <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-emerald-200/70">
                Up to ${filters.maxPrice.toFixed(0)} USD
              </span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {filteredProducts.map((product) => {
              const isSelected = selectedProducts.includes(product.id);
              return (
                <article
                  key={product.id}
                  className={`relative overflow-hidden rounded-3xl border bg-white/90 transition hover:-translate-y-1 hover:shadow-xl dark:bg-emerald-950/70 ${
                    isSelected
                      ? "border-emerald-500 shadow-emerald-500/20"
                      : "border-slate-200/70 shadow-emerald-900/5 dark:border-emerald-400/10"
                  }`}
                >
                  <div className="overflow-hidden bg-slate-900/5">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={640}
                      height={320}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                  <div className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-200">
                        {product.category}
                        {product.badges?.map((badge) => (
                          <span
                            key={badge}
                            className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-[0.65rem] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-100"
                          >
                            {badge}
                          </span>
                        ))}
                      </p>
                      <span className="text-sm font-semibold text-slate-500 dark:text-emerald-100/80">
                        {product.margin}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-emerald-50">
                        {product.name}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-emerald-100/80">
                        {product.description}
                      </p>
                    </div>
                    <div className="grid gap-3 text-sm text-slate-600 dark:text-emerald-100/80">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-emerald-50">
                          {formatPrice(product.price, product.currency)}
                        </span>
                        <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-emerald-200/70">
                          Min order {product.minOrder} units
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-emerald-200/70">
                          <IconClock className="h-4 w-4" />
                          {product.fulfillmentTime}
                        </span>
                        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-emerald-200/70">
                          <IconLocation className="h-4 w-4" />
                          {product.origin}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSelection(product.id)}
                      className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
                        isSelected
                          ? "bg-emerald-600 text-white hover:bg-emerald-500"
                          : "border border-slate-200/70 bg-white text-emerald-700 hover:border-emerald-500 hover:text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-950/90 dark:text-emerald-100"
                      }`}
                    >
                      <IconCart className="h-4 w-4" />
                      {isSelected ? "Added to quote cart" : "Add to quote cart"}
                    </button>
                  </div>
                  {isSelected ? (
                    <div className="absolute right-4 top-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        <IconArrow className="h-3.5 w-3.5" />
                        Selected
                      </span>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>

        <aside className="space-y-6 rounded-3xl border border-emerald-900/10 bg-emerald-50/80 p-6 shadow-inner dark:border-emerald-200/10 dark:bg-emerald-900/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-emerald-50">
              Quote cart summary
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-emerald-100/80">
              Share this bundle with fulfilment managers to lock-in stock, custom
              branding, and shipping routes.
            </p>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 text-sm text-slate-600 shadow-sm dark:bg-emerald-950/70 dark:text-emerald-100/80">
            <dl className="space-y-3">
              <div className="flex items-center justify-between">
                <dt className="font-medium text-slate-700 dark:text-emerald-50">
                  Selected SKUs
                </dt>
                <dd className="text-base font-semibold text-emerald-600 dark:text-emerald-200">
                  {selections.length}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-medium text-slate-700 dark:text-emerald-50">
                  Est. wholesale USD
                </dt>
                <dd className="text-base font-semibold text-emerald-600 dark:text-emerald-200">
                  ${estimatedUsd.toFixed(2)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-medium text-slate-700 dark:text-emerald-50">
                  Est. wholesale BDT
                </dt>
                <dd className="text-base font-semibold text-emerald-600 dark:text-emerald-200">
                  ৳{estimatedBdt.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </dd>
              </div>
            </dl>
          </div>
          <ul className="space-y-3">
            {selections.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-emerald-500/50 bg-white/60 p-4 text-sm text-emerald-700 dark:border-emerald-300/40 dark:bg-emerald-950/50 dark:text-emerald-100">
                Select SKUs to generate a shipping-ready manifest. We recommend mixing
                subscription and merchandise for a balanced margin profile.
              </li>
            ) : (
              selections.map((product) => (
                <li
                  key={product.id}
                  className="flex items-start justify-between gap-3 rounded-2xl bg-white/90 p-4 text-sm shadow-sm dark:bg-emerald-950/80"
                >
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-emerald-50">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-emerald-200/70">
                      {product.category} • Min order {product.minOrder}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSelection(product.id)}
                    className="text-xs font-semibold text-emerald-700 transition hover:text-emerald-500 dark:text-emerald-100"
                  >
                    Remove
                  </button>
                </li>
              ))
            )}
          </ul>
          <button
            type="button"
            className="w-full rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/30 transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            onClick={() =>
              alert(
                "We will assemble your Bangladesh fulfillment brief and email you shipping quotes within 24 hours.",
              )
            }
          >
            Request fulfillment briefing
          </button>
          <p className="text-xs text-slate-500 dark:text-emerald-200/60">
            Quoted lead times assume Bangladesh origin. Need EU or MENA fulfillment?
            Note this in your briefing request and we&apos;ll route stock accordingly.
          </p>
        </aside>
      </section>

      <section className="grid gap-8 rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-sm dark:border-emerald-200/10 dark:bg-emerald-950/50 md:grid-cols-3">
        {[
          {
            title: "Localized compliance spine",
            copy: "Full playbooks for BIDA registration, cross-border invoicing, and Spotify licensing tailored to Bangladesh operators.",
          },
          {
            title: "Pick-pack & brand",
            copy: "We integrate with garment partners in Gazipur and Narayanganj for custom dye-sublimation, swing tags, and Shopify-ready SKU barcodes.",
          },
          {
            title: "Automated renewals",
            copy: "API webhooks synchronize subscription renewals, late payment handling, and customer dashboards so you can scale without manual ops.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="space-y-3 rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-emerald-400/10 dark:bg-emerald-950/80"
          >
            <IconSpark className="h-6 w-6 text-emerald-600 dark:text-emerald-200" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-emerald-50">
              {item.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-emerald-100/80">
              {item.copy}
            </p>
          </div>
        ))}
      </section>

      <section
        id="playbook"
        className="grid gap-6 rounded-3xl border border-emerald-900/10 bg-emerald-950/90 p-8 text-emerald-50 shadow-lg md:grid-cols-[1.1fr_1fr]"
      >
        <div className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Bangladesh logistics advantage
          </p>
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            3-step fulfillment pipeline designed for Spotify dropshippers.
          </h2>
          <ol className="space-y-5 text-sm text-emerald-100/90">
            <li className="rounded-2xl bg-emerald-900/60 p-4">
              <p className="font-semibold text-emerald-50">1. Catalog alignment</p>
              <p className="mt-2 text-emerald-100/80">
                Sync your storefront with our SKU feed. We align pricing, currency, and
                bundle logic for your target markets in North America, the Gulf, and
                Southeast Asia.
              </p>
            </li>
            <li className="rounded-2xl bg-emerald-900/60 p-4">
              <p className="font-semibold text-emerald-50">2. Compliance & billing</p>
              <p className="mt-2 text-emerald-100/80">
                We generate VAT-ready invoicing, BDT &lt;&gt; USD settlement paths, and
                Spotify brand usage approvals so you can scale without legal gaps.
              </p>
            </li>
            <li className="rounded-2xl bg-emerald-900/60 p-4">
              <p className="font-semibold text-emerald-50">3. Global fulfillment</p>
              <p className="mt-2 text-emerald-100/80">
                Hybrid digital and physical fulfillment from Dhaka, with partner hubs in
                Kuala Lumpur and Dubai for 3-5 day last-mile delivery.
              </p>
            </li>
          </ol>
        </div>
        <div className="space-y-6 rounded-3xl border border-emerald-300/20 bg-emerald-900/40 p-6">
          <h3 className="text-xl font-semibold text-emerald-50">
            Fulfillment service level agreements
          </h3>
          <ul className="space-y-4 text-sm text-emerald-100/80">
            <li className="flex items-center gap-3">
              <IconClock className="h-5 w-5 text-emerald-300" />
              <span>Premium account provisioning within 4 business hours.</span>
            </li>
            <li className="flex items-center gap-3">
              <IconLocation className="h-5 w-5 text-emerald-300" />
              <span>Paperless customs documentation for EU, UK, and GCC markets.</span>
            </li>
            <li className="flex items-center gap-3">
              <IconCart className="h-5 w-5 text-emerald-300" />
              <span>Bundled SKUs synced to Shopify, WooCommerce, and custom stacks.</span>
            </li>
            <li className="flex items-center gap-3">
              <IconSpark className="h-5 w-5 text-emerald-300" />
              <span>Integrated marketing accelerators: playlist placement and KOL kits.</span>
            </li>
          </ul>
          <button
            type="button"
            className="w-full rounded-full border border-emerald-400/40 bg-transparent px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200 hover:text-white"
            onClick={() =>
              window.open(
                "mailto:ops@spotifydropship.bd?subject=Bangladesh%20Spotify%20Dropshipping%20Brief",
              )
            }
          >
            Email Bangladesh operations desk
          </button>
        </div>
      </section>

      <section
        id="partners"
        className="grid gap-6 rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-sm dark:border-emerald-200/10 dark:bg-emerald-950/50 md:grid-cols-[1fr_1fr]"
      >
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-emerald-50">
            Partnership tiers
          </h2>
          <p className="text-sm text-slate-600 dark:text-emerald-100/80">
            Choose a partnership model that matches your growth curve. Upgrade anytime
            as volume scales.
          </p>
          <div className="space-y-4">
            {[
              {
                title: "Starter (0-200 orders / month)",
                perks: [
                  "Manual Dropbox manifest sync",
                  "Bangladesh-centric pricing matrix",
                  "Weekend live chat support",
                ],
              },
              {
                title: "Accelerator (200-1000 orders / month)",
                perks: [
                  "Automated subscription renewals API",
                  "Dedicated account manager in Dhaka",
                  "Co-branded marketing materials",
                ],
              },
              {
                title: "Enterprise (1000+ orders / month)",
                perks: [
                  "Global warehousing add-ons",
                  "Credit terms & revenue-sharing",
                  "Joint innovation roadmap",
                ],
              },
            ].map((tier) => (
              <div
                key={tier.title}
                className="space-y-3 rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-emerald-400/10 dark:bg-emerald-950/80"
              >
                <p className="text-base font-semibold text-slate-900 dark:text-emerald-50">
                  {tier.title}
                </p>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-emerald-100/80">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <IconArrow className="mt-1 h-4 w-4 text-emerald-500" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div
          id="contact"
          className="space-y-4 rounded-3xl border border-emerald-900/10 bg-emerald-50/60 p-6 shadow-inner dark:border-emerald-200/10 dark:bg-emerald-900/60"
        >
          <h3 className="text-xl font-semibold text-slate-900 dark:text-emerald-50">
            Request onboarding call
          </h3>
          <p className="text-sm text-slate-600 dark:text-emerald-100/80">
            Submit your storefront blueprint and we will schedule a 30-minute onboarding
            session with our Bangladesh operations team.
          </p>
          <form className="space-y-4">
            <div>
              <label
                htmlFor="business-name"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-emerald-200/70"
              >
                Business name
              </label>
              <input
                id="business-name"
                name="business-name"
                type="text"
                required
                placeholder="Spotify Shop Bangladesh Ltd."
                className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white px-4 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-emerald-500/30 dark:bg-emerald-950/80 dark:text-emerald-50"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-emerald-200/70"
              >
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="ops@yourstore.com"
                className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white px-4 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-emerald-500/30 dark:bg-emerald-950/80 dark:text-emerald-50"
              />
            </div>
            <div>
              <label
                htmlFor="volume"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-emerald-200/70"
              >
                Monthly volume target
              </label>
              <select
                id="volume"
                name="volume"
                className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white px-4 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-emerald-500/30 dark:bg-emerald-950/80 dark:text-emerald-50"
              >
                <option value="0-100">0 - 100 orders</option>
                <option value="100-500">100 - 500 orders</option>
                <option value="500-1500">500 - 1500 orders</option>
                <option value="1500+">1500+ orders</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="notes"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-emerald-200/70"
              >
                Notes for operations
              </label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Share target geographies, marketing goals, or logistics constraints…"
                className="mt-1 min-h-[120px] w-full rounded-xl border border-slate-200/70 bg-white px-4 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-emerald-500/30 dark:bg-emerald-950/80 dark:text-emerald-50"
              />
            </div>
            <button
              type="submit"
              onClick={(event) => {
                event.preventDefault();
                alert(
                  "Thank you! Our Bangladesh operations lead will reach out within 1 business day.",
                );
              }}
              className="w-full rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/30 transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Submit blueprint
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-900/10 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 p-8 text-emerald-50 shadow-lg">
        <div className="grid gap-6 md:grid-cols-[2fr_1fr] md:items-center">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
              Ready to launch
            </p>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Your Spotify storefront can go live in under 7 days.
            </h2>
            <p className="text-sm text-emerald-100/90">
              We shoulder compliance, logistics, and renewal automation so you can focus
              on growth. Bangladesh leads the region in Spotify adoption—tap into that
              infrastructure from anywhere in the world.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Build my Spotify store
          </button>
        </div>
      </section>
    </div>
  );
}
