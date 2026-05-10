import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  console.log("Seeding database...");

  // Countries
  const countries = [
    { name: "United Kingdom", code: "GB", flag_emoji: "🇬🇧", region: "Europe" },
    { name: "France", code: "FR", flag_emoji: "🇫🇷", region: "Europe" },
    { name: "Germany", code: "DE", flag_emoji: "🇩🇪", region: "Europe" },
    { name: "Italy", code: "IT", flag_emoji: "🇮🇹", region: "Europe" },
    { name: "Spain", code: "ES", flag_emoji: "🇪🇸", region: "Europe" },
    { name: "Portugal", code: "PT", flag_emoji: "🇵🇹", region: "Europe" },
    { name: "Netherlands", code: "NL", flag_emoji: "🇳🇱", region: "Europe" },
    { name: "Switzerland", code: "CH", flag_emoji: "🇨🇭", region: "Europe" },
    { name: "United States", code: "US", flag_emoji: "🇺🇸", region: "North America" },
    { name: "Canada", code: "CA", flag_emoji: "🇨🇦", region: "North America" },
    { name: "Mexico", code: "MX", flag_emoji: "🇲🇽", region: "North America" },
    { name: "Japan", code: "JP", flag_emoji: "🇯🇵", region: "Asia" },
    { name: "South Korea", code: "KR", flag_emoji: "🇰🇷", region: "Asia" },
    { name: "Thailand", code: "TH", flag_emoji: "🇹🇭", region: "Asia" },
    { name: "Australia", code: "AU", flag_emoji: "🇦🇺", region: "Oceania" },
    { name: "Global", code: "XX", flag_emoji: "🌍", region: "Global" },
  ];

  const { error: countryError } = await supabase
    .from("countries")
    .upsert(countries, { onConflict: "code" });

  if (countryError) {
    console.error("Countries error:", countryError);
    process.exit(1);
  }
  console.log(`Inserted/updated ${countries.length} countries.`);

  // Get country IDs
  const { data: countryData } = await supabase
    .from("countries")
    .select("id, code");
  const countryMap = new Map(
    (countryData || []).map((c) => [c.code, c.id])
  );

  // Clear existing plans
  const { error: deleteError } = await supabase
    .from("plans")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all

  if (deleteError) {
    console.error("Delete plans error:", deleteError);
  }

  const plans = [
    // UK
    { country_id: countryMap.get("GB"), name: "UK 5GB", description: "5GB high-speed data across the United Kingdom. Perfect for a week trip.", data_amount_gb: 5, validity_days: 14, price_cents: 999, coverage_type: "country", popular: false, apn: "internet" },
    { country_id: countryMap.get("GB"), name: "UK 20GB", description: "20GB high-speed data in the United Kingdom. Great for longer stays.", data_amount_gb: 20, validity_days: 30, price_cents: 1999, coverage_type: "country", popular: true, apn: "internet" },
    { country_id: countryMap.get("GB"), name: "UK 50GB", description: "50GB for heavy data users in the UK.", data_amount_gb: 50, validity_days: 30, price_cents: 3499, coverage_type: "country", popular: false, apn: "internet" },
    // France
    { country_id: countryMap.get("FR"), name: "France 10GB", description: "10GB high-speed data throughout France.", data_amount_gb: 10, validity_days: 14, price_cents: 1299, coverage_type: "country", popular: false, apn: "internet" },
    { country_id: countryMap.get("FR"), name: "France 30GB", description: "30GB across France. Ideal for digital nomads.", data_amount_gb: 30, validity_days: 30, price_cents: 2799, coverage_type: "country", popular: true, apn: "internet" },
    // Germany
    { country_id: countryMap.get("DE"), name: "Germany 10GB", description: "10GB across Germany on the best networks.", data_amount_gb: 10, validity_days: 14, price_cents: 1299, coverage_type: "country", popular: false, apn: "internet" },
    { country_id: countryMap.get("DE"), name: "Germany 30GB", description: "30GB for Germany. Reliable coverage nationwide.", data_amount_gb: 30, validity_days: 30, price_cents: 2799, coverage_type: "country", popular: false, apn: "internet" },
    // Italy
    { country_id: countryMap.get("IT"), name: "Italy 15GB", description: "15GB throughout Italy. From Milan to Sicily.", data_amount_gb: 15, validity_days: 21, price_cents: 1599, coverage_type: "country", popular: true, apn: "internet" },
    // Spain
    { country_id: countryMap.get("ES"), name: "Spain 15GB", description: "15GB across Spain including the Canary Islands.", data_amount_gb: 15, validity_days: 21, price_cents: 1499, coverage_type: "country", popular: false, apn: "internet" },
    // USA
    { country_id: countryMap.get("US"), name: "USA 10GB", description: "10GB across the United States.", data_amount_gb: 10, validity_days: 14, price_cents: 1499, coverage_type: "country", popular: false, apn: "internet" },
    { country_id: countryMap.get("US"), name: "USA 30GB", description: "30GB USA-wide coverage. Great for road trips.", data_amount_gb: 30, validity_days: 30, price_cents: 2999, coverage_type: "country", popular: true, apn: "internet" },
    { country_id: countryMap.get("US"), name: "USA Unlimited", description: "Unlimited data in the USA (fair use: 50GB).", data_amount_gb: 50, validity_days: 30, price_cents: 4499, coverage_type: "country", popular: false, apn: "internet" },
    // Japan
    { country_id: countryMap.get("JP"), name: "Japan 10GB", description: "10GB high-speed data throughout Japan.", data_amount_gb: 10, validity_days: 14, price_cents: 1399, coverage_type: "country", popular: true, apn: "internet" },
    { country_id: countryMap.get("JP"), name: "Japan 30GB", description: "30GB for Japan. Perfect for extended travel.", data_amount_gb: 30, validity_days: 30, price_cents: 2999, coverage_type: "country", popular: false, apn: "internet" },
    // Regional
    { country_id: countryMap.get("XX"), name: "Europe 10GB", description: "10GB across 30+ European countries. One eSIM for the whole trip.", data_amount_gb: 10, validity_days: 14, price_cents: 1199, coverage_type: "regional", coverage_region: "Europe", popular: true, apn: "internet" },
    { country_id: countryMap.get("XX"), name: "Europe 50GB", description: "50GB across Europe. Stream, navigate, and work.", data_amount_gb: 50, validity_days: 30, price_cents: 3499, coverage_type: "regional", coverage_region: "Europe", popular: true, apn: "internet" },
    { country_id: countryMap.get("XX"), name: "Asia 15GB", description: "15GB across 12 Asian countries.", data_amount_gb: 15, validity_days: 21, price_cents: 1999, coverage_type: "regional", coverage_region: "Asia", popular: false, apn: "internet" },
    { country_id: countryMap.get("XX"), name: "Global 20GB", description: "20GB global eSIM. Works in 100+ countries.", data_amount_gb: 20, validity_days: 30, price_cents: 2999, coverage_type: "regional", coverage_region: "Global", popular: true, apn: "internet" },
  ];

  const { error: planError } = await supabase.from("plans").insert(plans);

  if (planError) {
    console.error("Plans error:", planError);
    process.exit(1);
  }
  console.log(`Inserted ${plans.length} plans.`);
  console.log("Seed complete!");
}

seed();
