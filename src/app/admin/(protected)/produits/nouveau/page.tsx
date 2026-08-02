import { createProduct } from "@/app/admin/actions";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Ajouter un produit</h1>
      <div className="mt-6 rounded-2xl bg-cream-100 p-6">
        <ProductForm action={createProduct} submitLabel="Créer le produit" />
      </div>
    </div>
  );
}
