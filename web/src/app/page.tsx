import { Storefront } from "@/components/storefront";
import { products } from "@/data/products";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6">
      <Storefront items={products} />
    </div>
  );
}
