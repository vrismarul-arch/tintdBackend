import supabase from "../config/supabase.js";

export const uploadToSupabase = async (file) => {
  if (!file) throw new Error("No file provided");

  // 🔥 SANITIZE filename (VERY IMPORTANT)
  const safeName = file.originalname
    .trim()
    .replace(/\s+/g, "-")              // replace spaces
    .replace(/[^a-zA-Z0-9.-]/g, "")    // remove unsafe chars
    .toLowerCase();

  const fileName = `event-splash/${Date.now()}-${safeName}`;

  // upload to Supabase
  const { error } = await supabase.storage
    .from("tintd")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    throw error;
  }

  // 🔥 ALWAYS return PUBLIC URL
  const { data } = supabase.storage
    .from("tintd")
    .getPublicUrl(fileName);

  if (!data?.publicUrl) {
    throw new Error("Failed to get public URL");
  }

  return data.publicUrl;
};
  