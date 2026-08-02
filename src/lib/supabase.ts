import { createClient } from "@supabase/supabase-js";

const PRODUCT_IMAGES_BUCKET = "product-images";

/**
 * Client Supabase côté serveur uniquement (clé service_role) — jamais exposé
 * au navigateur. Utilisé pour uploader les photos produits vers Storage.
 */
function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être configurés pour uploader des images.",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export async function uploadProductImage(file: File, slug: string): Promise<string> {
  const supabase = getSupabaseAdmin();

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${slug}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(`Échec de l'upload de l'image : ${error.message}`);
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
