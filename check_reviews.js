import { createClient } from "@supabase/supabase-js";

async function check() {
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_KEY);
  const { data, error } = await supabase.from('products').select(`name, reviews(rating)`).limit(1);
  console.log("DATA:", JSON.stringify(data), "ERROR:", error);
}

check();
