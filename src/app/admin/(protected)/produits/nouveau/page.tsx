import { createProduct } from "@/app/admin/actions";
import { ProductForm } from "@/components/admin/ProductForm";
import { db } from "@/lib/db";

export default async function NewProductPage() {
  const feeds = await db.productFeed.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Ajouter un produit</h1>
      <div className="mt-6 rounded-2xl bg-cream-100 p-6">
        <ProductForm action={createProduct} submitLabel="Créer le produit" feeds={feeds} />
      </div>
    </div>
  );
}
