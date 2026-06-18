import { getDb, initDatabase } from "./index.js";
import type { FaqEntry } from "../types.js";
import { v4 as uuidv4 } from "uuid";

/**
 * FAQ seed data for Lunara — a fictional artisan home goods store.
 */
const faqData: Omit<FaqEntry, "id">[] = [
  {
    category: "shipping",
    question: "What is your shipping policy?",
    answer:
      "We offer free standard shipping on all orders over $75. Standard shipping takes 3–5 business days within the US. Expedited shipping (1–2 business days) is available for a flat $12.99. We also ship internationally to over 40 countries — international orders typically arrive in 7–14 business days and shipping costs are calculated at checkout based on destination and weight.",
  },
  {
    category: "shipping",
    question: "Do you ship internationally?",
    answer:
      "Yes! We ship to over 40 countries worldwide. International shipping typically takes 7–14 business days. Shipping costs are calculated at checkout based on your destination and order weight. Please note that customs duties and import taxes may apply and are the responsibility of the buyer.",
  },
  {
    category: "shipping",
    question: "How can I track my order?",
    answer:
      "Once your order ships, you'll receive a confirmation email with a tracking number and a link to track your package. You can also check your order status anytime by visiting our website and entering your order number on the Order Tracking page. If you haven't received tracking info within 2 business days of your order, please reach out to our support team.",
  },
  {
    category: "returns",
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy on all items. Products must be in their original condition and packaging. To initiate a return, email us at returns@lunara.store with your order number. Once we receive and inspect the item, we'll process your refund within 5–7 business days to your original payment method. Return shipping is free for US orders — we'll send you a prepaid label.",
  },
  {
    category: "returns",
    question: "Can I exchange an item?",
    answer:
      "Absolutely! We're happy to exchange items within 30 days of purchase. Simply email returns@lunara.store with your order number and the item you'd like instead. If the new item has a price difference, we'll charge or refund the difference accordingly. Exchanges ship free within the US.",
  },
  {
    category: "returns",
    question: "What if I receive a damaged item?",
    answer:
      "We're sorry if something arrived damaged! Please email support@lunara.store with your order number and photos of the damage within 48 hours of delivery. We'll send a replacement at no extra cost or issue a full refund — your choice. No need to return the damaged item.",
  },
  {
    category: "support",
    question: "What are your support hours?",
    answer:
      "Our support team is available Monday through Friday, 9:00 AM to 6:00 PM Eastern Time. You can reach us via live chat on our website or by emailing support@lunara.store. We aim to respond to all emails within 4 hours during business hours. For urgent issues outside business hours, our AI assistant is available 24/7 to help with common questions.",
  },
  {
    category: "support",
    question: "How do I contact support?",
    answer:
      "You can reach our support team in several ways: (1) Live chat — click the chat icon on our website during business hours, (2) Email — send a message to support@lunara.store, (3) This AI assistant — available 24/7 for instant help with common questions. For the fastest response, live chat is your best bet during business hours (Mon–Fri, 9 AM – 6 PM ET).",
  },
  {
    category: "payments",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, Google Pay, and Shop Pay. All transactions are securely processed and encrypted. We also offer Buy Now, Pay Later through Afterpay — split your purchase into 4 interest-free payments.",
  },
  {
    category: "products",
    question: "Are your products handmade?",
    answer:
      "Many of our products are handcrafted by skilled artisans from around the world. Each product page indicates whether the item is handmade, and includes details about the artisan or workshop that created it. Due to the handmade nature, slight variations in color, size, and pattern are normal and part of what makes each piece unique.",
  },
  {
    category: "products",
    question: "Do you offer gift wrapping?",
    answer:
      "Yes! We offer premium gift wrapping for $5.99 per item. Select the gift wrap option during checkout and you can include a personalized message card at no extra charge. Our gift wrapping features recycled kraft paper, a dried botanical accent, and a hand-written tag — perfect for any occasion.",
  },
  {
    category: "account",
    question: "Do I need an account to place an order?",
    answer:
      "No, you can check out as a guest! However, creating a free account lets you track orders, save your shipping addresses, view order history, and earn rewards points on every purchase. Sign up takes less than a minute.",
  },
];

/**
 * Seed the database with FAQ entries.
 * Clears existing FAQ data and inserts fresh seed data.
 */
export function seedFaqData(): void {
  const db = getDb();

  const deleteStmt = db.prepare("DELETE FROM faq_entries");
  const insertStmt = db.prepare(
    "INSERT INTO faq_entries (id, category, question, answer) VALUES (?, ?, ?, ?)"
  );

  const seedTransaction = db.transaction(() => {
    deleteStmt.run();
    for (const faq of faqData) {
      insertStmt.run(uuidv4(), faq.category, faq.question, faq.answer);
    }
  });

  seedTransaction();
  console.log(`✅ Seeded ${faqData.length} FAQ entries.`);
}

/**
 * Get all FAQ entries from the database.
 */
export function getAllFaqEntries(): FaqEntry[] {
  const db = getDb();
  return db.prepare("SELECT * FROM faq_entries").all() as FaqEntry[];
}

/**
 * Format FAQ entries into a string for the LLM system prompt.
 */
export function formatFaqForPrompt(): string {
  const entries = getAllFaqEntries();

  if (entries.length === 0) {
    return "No FAQ data available.";
  }

  const grouped = entries.reduce(
    (acc, entry) => {
      if (!acc[entry.category]) acc[entry.category] = [];
      acc[entry.category].push(entry);
      return acc;
    },
    {} as Record<string, FaqEntry[]>
  );

  let result = "";
  for (const [category, items] of Object.entries(grouped)) {
    result += `\n### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
    for (const item of items) {
      result += `**Q: ${item.question}**\nA: ${item.answer}\n\n`;
    }
  }

  return result.trim();
}

// Allow running as a standalone script: tsx src/db/seed.ts
const isMainModule =
  process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js");
if (isMainModule) {
  // Need to load config for DATABASE_PATH
  await import("../config.js");
  initDatabase();
  seedFaqData();
  console.log("🌱 Seeding complete!");
  process.exit(0);
}
