import type { SupportedLocale } from "@/lib/constants";

export type TranslationKey = keyof typeof en;

const en = {
  // Navigation
  "nav.home": "Home",
  "nav.dashboard": "Dashboard",
  "nav.household": "Household",
  "nav.pantry": "Pantry",
  "nav.plan": "Plan",
  "nav.history": "History",
  "nav.affordability": "Affordability",
  "nav.getStarted": "Get Started",

  // Landing
  "landing.tagline": "Eat better with what you have.",
  "landing.subtitle":
    "Nourish helps households find the best achievable nutrition based on their family, available food, local prices and actual budget.",
  "landing.ethiopiaFirst": "Built for Ethiopia first. Designed to scale globally.",
  "landing.problem.title": "The Problem",
  "landing.problem.body":
    "Many households know what they should eat but cannot afford the ideal diet. Generic meal planners ignore real budgets, local food prices, and what is already in the pantry.",
  "landing.how.title": "How Nourish Works",
  "landing.how.body":
    "Nourish models your household's nutritional needs, available budget, pantry items, and regional food prices — then finds the best achievable nutrition under those real constraints.",
  "landing.household.title": "Household Experience",
  "landing.household.body":
    "Set up your family profile, track what's in your pantry, enter your daily food budget, and receive optimized meal plans based on deterministic calculations — not guesswork.",
  "landing.voice.title": "Low-Connectivity Access",
  "landing.voice.planned": "Planned",
  "landing.voice.body":
    "Future Nourish Voice will bring the same optimization engine to feature phones via IVR, reaching households without smartphones.",
  "landing.impact.title": "Population Impact",
  "landing.impact.planned": "Planned",
  "landing.impact.body":
    "Future Nourish Impact will provide privacy-preserving, consent-based analytics for NGOs and public health organizations — never exposing individual household identities.",
  "landing.methodology.title": "Data Integrity",
  "landing.methodology.body":
    "Nutrient values come from authoritative food composition tables. Prices from verified surveys. Requirements from established reference standards. AI explains results — it never invents them.",

  // Dashboard
  "dashboard.title": "Household Dashboard",
  "dashboard.noHousehold": "No household set up yet.",
  "dashboard.createHousehold": "Create your household",
  "dashboard.members": "Members",
  "dashboard.todaysBudget": "Today's Budget",
  "dashboard.noBudget": "No budget entered for today",
  "dashboard.pantrySummary": "Pantry",
  "dashboard.pantryItems": "{count} items",
  "dashboard.emptyPantry": "Pantry is empty",
  "dashboard.recentPlan": "Recent Plan",
  "dashboard.noPlan": "No calculated plan exists yet",
  "dashboard.planPending": "Plan pending optimization",

  // Household
  "household.title": "Household Profile",
  "household.name": "Household name",
  "household.region": "Region",
  "household.members": "Members",
  "household.addMember": "Add member",
  "household.editMember": "Edit member",
  "household.memberName": "Name",
  "household.dateOfBirth": "Date of birth",
  "household.sex": "Sex",
  "household.pregnancyStatus": "Pregnancy / lactation status",
  "household.allergies": "Allergies",
  "household.dietaryRestrictions": "Dietary restrictions",
  "household.save": "Save",
  "household.cancel": "Cancel",
  "household.delete": "Remove",
  "household.create": "Create household",

  // Pantry
  "pantry.title": "Pantry",
  "pantry.addItem": "Add pantry item",
  "pantry.food": "Food",
  "pantry.quantity": "Quantity",
  "pantry.unit": "Unit",
  "pantry.empty": "Your pantry is empty. Add items when food data is available.",
  "pantry.noFoods": "No foods in the database yet. Food data will be imported from authoritative sources.",
  "pantry.notes": "Notes",

  // Plan
  "plan.title": "Meal Plan",
  "plan.date": "Date",
  "plan.budget": "Available budget",
  "plan.currency": "Currency",
  "plan.submit": "Prepare optimization request",
  "plan.notCalculated": "Nutrition optimization engine not yet calculated",
  "plan.notCalculatedDetail":
    "Your budget and constraints have been saved. The deterministic optimization engine will process this request in a future release.",
  "plan.pending": "Optimization pending",

  // History
  "history.title": "Nutrient History",
  "history.empty": "No nutrient history recorded yet. History will appear after optimized meal plans are calculated.",
  "history.date": "Date",
  "history.plan": "Plan",

  // Affordability
  "affordability.title": "Affordability Gap",
  "affordability.empty":
    "Affordability analysis requires calculated meal plans and nutrient coverage data. This feature will identify nutrition targets that cannot be reached under your reported constraints.",
  "affordability.planned": "Planned capability",

  // Common
  "common.loading": "Loading…",
  "common.error": "Something went wrong",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.back": "Back",
  "common.notAvailable": "Not available",
} as const;

const am: Record<TranslationKey, string> = {
  "nav.home": "መነሻ",
  "nav.dashboard": "لوحة መረጃ",
  "nav.household": "ቤተሰብ",
  "nav.pantry": "መጋዘን",
  "nav.plan": "እቅድ",
  "nav.history": "ታሪክ",
  "nav.affordability": "ተገዢነት",
  "nav.getStarted": "ጀምር",

  "landing.tagline": "ከיש לך ጋር የተሻለ ምግብ ይመገቡ።",
  "landing.subtitle":
    "Nourish ለቤተሰብዎ፣ ለእርስዎ የሚገኝ ምግብ፣ ለአካባቢዎ ዋጋ እና ለበጀትዎ መሠረት በጣም የሚቻለውን ምግብ ይረዳል።",
  "landing.ethiopiaFirst": "ለኢትዮጵያ በመጀመሪያ ተገንብቷል። በዓለም አቀፍ ሁኔታ ለማስፋፋት ተዘጋጅቷል።",
  "landing.problem.title": "ችግሩ",
  "landing.problem.body":
    "ብዙ ቤተሰቦች ምን መመገብ እንዳለባቸው ያውቃሉ፣ ግን ተመራጭ ምግብ ሊቀርቡ አይችሉም።",
  "landing.how.title": "Nourish እንዴት ይሠራል",
  "landing.how.body":
    "Nourish የቤተሰብዎን የغذایی ፍላጎት፣ በጀት፣ መጋዘን እና ዋጋዎችን ይወስናል — ከዚያም በእነዚህ ገደቦች ውስጥ ምርጥ ምግብ ይፈልጋል።",
  "landing.household.title": "የቤተሰብ تجربة",
  "landing.household.body":
    "የቤተሰብ መገለጫዎን ያዘጋጁ፣ መጋዘንዎን ይመድቡ፣ የዕለቱን በጀት ያስገቡ።",
  "landing.voice.title": "ዝቅተኛ ግንኙነት",
  "landing.voice.planned": "ታላላክ",
  "landing.voice.body": "የወደፊት Nourish Voice በIVR ተመሳሳይ ሞተር ይ brings.",
  "landing.impact.title": "የНаселения تأثير",
  "landing.impact.planned": "ታላላክ",
  "landing.impact.body": "የወደፊት Nourish Impact ግላዊነትን የሚ respect analytics ይ provide.",
  "landing.methodology.title": "የመረጃ ታማኝነት",
  "landing.methodology.body": "የغذایی 값은 ከ authoritative sources ይ obtained.",

  "dashboard.title": "የቤተሰብ لوحة",
  "dashboard.noHousehold": "ቤተሰብ ገና አልተዘጋጀም።",
  "dashboard.createHousehold": "ቤተሰብዎን ይፍጠሩ",
  "dashboard.members": "አባላት",
  "dashboard.todaysBudget": "የዛሬ በጀት",
  "dashboard.noBudget": "ለዛሬ በጀት አልተ entered",
  "dashboard.pantrySummary": "መጋዘን",
  "dashboard.pantryItems": "{count} ንጥሎች",
  "dashboard.emptyPantry": "መጋዘን ባዶ ነው",
  "dashboard.recentPlan": "የቅርብ ጊዜ እቅድ",
  "dashboard.noPlan": "calculated plan የለም",
  "dashboard.planPending": "optimization በመጠበቅ",

  "household.title": "የቤተሰብ መገለጫ",
  "household.name": "የቤተሰብ ስም",
  "household.region": "ክልል",
  "household.members": "አባላት",
  "household.addMember": "አባል ጨምር",
  "household.editMember": "አባል አርትዕ",
  "household.memberName": "ስም",
  "household.dateOfBirth": "የትውልድ ቀን",
  "household.sex": "ጾታ",
  "household.pregnancyStatus": "እርግዝና / lactation",
  "household.allergies": "አለርጂዎች",
  "household.dietaryRestrictions": "የغذایی ገደቦች",
  "household.save": "አስቀምጥ",
  "household.cancel": "ሰርዝ",
  "household.delete": "አስወግድ",
  "household.create": "ቤተሰብ ፍጠር",

  "pantry.title": "መጋዘን",
  "pantry.addItem": "ንጥል ጨምር",
  "pantry.food": "ምግብ",
  "pantry.quantity": "ብዛት",
  "pantry.unit": "יחידה",
  "pantry.empty": "መጋዘንዎ ባዶ ነው።",
  "pantry.noFoods": "food database ባዶ ነው።",
  "pantry.notes": "ማስታወሻ",

  "plan.title": "Meal Plan",
  "plan.date": "ቀን",
  "plan.budget": "Available budget",
  "plan.currency": "Currency",
  "plan.submit": "Prepare optimization",
  "plan.notCalculated": "Nutrition optimization engine not yet calculated",
  "plan.notCalculatedDetail": "Your request has been saved.",
  "plan.pending": "Optimization pending",

  "history.title": "Nutrient History",
  "history.empty": "No history yet.",
  "history.date": "Date",
  "history.plan": "Plan",

  "affordability.title": "Affordability Gap",
  "affordability.empty": "Requires calculated plans.",
  "affordability.planned": "Planned",

  "common.loading": "Loading…",
  "common.error": "Something went wrong",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.back": "Back",
  "common.notAvailable": "Not available",
};

const dictionaries: Record<SupportedLocale, Record<TranslationKey, string>> = {
  en,
  am,
};

export function getTranslations(locale: SupportedLocale) {
  const dict = dictionaries[locale] ?? dictionaries.en;

  return function t(
    key: TranslationKey,
    params?: Record<string, string | number>,
  ): string {
    let text: string = dict[key] ?? dictionaries.en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  };
}

export { en, am };
