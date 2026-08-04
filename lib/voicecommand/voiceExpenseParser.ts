import { Category } from "@/lib/types";

type ExpenseFormState = {
  a: string;
  c: string;
  d: string;
};

/**
 * Escape category names so they can safely be used in RegExp.
 */
function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Returns YYYY-MM-DD for today/tomorrow/yesterday.
 */
function getDateFromWord(word: string): string {
  const date = new Date();

  if (word === "tomorrow") {
    date.setDate(date.getDate() + 1);
  }

  if (word === "yesterday") {
    date.setDate(date.getDate() - 1);
  }

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Finds today/tomorrow/yesterday in transcript.
 *
 * If no date word is spoken, today is used.
 */
function extractDate(text: string): string {
  const normalized = text.toLowerCase();

  const match = normalized.match(
    /\b(today|tomorrow|yesterday)\b/
  );

  if (!match) {
    return getDateFromWord("today");
  }

  return getDateFromWord(match[1]);
}

/**
 * Finds a numeric amount.
 *
 * Examples:
 * "Food 450 today" -> 450
 * "Food ₹450 today" -> 450
 * "Food 1,250 today" -> 1250
 * "Food 450.50 today" -> 450.50
 */
function extractAmount(
  text: string
): string | null {
  const match = text.match(
    /(?:₹\s*)?(\d+(?:,\d{3})*(?:\.\d+)?)/ 
  );

  if (!match) {
    return null;
  }

  return match[1].replace(/,/g, "");
}

/**
 * Finds the category from the categories already
 * loaded by your application.
 *
 * Matching is case-insensitive.
 *
 * Example:
 * cats = ["Food", "Travel", "Online Shopping"]
 *
 * "online shopping 500 today"
 * -> Online Shopping category
 */
function extractCategory(
  text: string,
  categories: Category[]
): Category | null {
  const normalizedText =
    text.toLowerCase();

  // Longest categories first.
  // This prevents "Shopping" from matching before
  // "Online Shopping".
  const sortedCategories = [
    ...categories,
  ].sort(
    (a, b) =>
      b.n.length - a.n.length
  );

  for (const category of sortedCategories) {
    const categoryName =
      category.n.trim();

    if (!categoryName) continue;

    const regex = new RegExp(
      `\\b${escapeRegex(
        categoryName
      )}\\b`,
      "i"
    );

    if (regex.test(normalizedText)) {
      return category;
    }
  }

  return null;
}

export function parseExpenseSpeech(
  transcript: string,
  categories: Category[]
): ExpenseFormState {
  const amount =
    extractAmount(transcript);

  const category =
    extractCategory(
      transcript,
      categories
    );

  const date =
    extractDate(transcript);

  return {
    a: amount ?? "",
    c: category?._id ?? "",
    d: date,
  };
}