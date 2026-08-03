type TodoFormState = {
  t: string;
  p: string;
  da: string;
};

const PRIORITIES = [
  "low",
  "medium",
  "high",
  "mandatory",
] as const;

type Priority = (typeof PRIORITIES)[number];

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

function extractPriority(
  text: string
): Priority | null {
  const normalized = text.toLowerCase();

  // Check longest words first.
  const sorted = [...PRIORITIES].sort(
    (a, b) => b.length - a.length
  );

  for (const priority of sorted) {
    const regex = new RegExp(
      `\\b${priority}\\b`,
      "i"
    );

    if (regex.test(normalized)) {
      return priority;
    }
  }

  return null;
}

function extractDateWord(
  text: string
): "today" | "tomorrow" | "yesterday" | null {
  const match = text
    .toLowerCase()
    .match(
      /\b(today|tomorrow|yesterday)\b/
    );

  return match ? (match[1] as any) : null;
}

function extractTodoText(
  text: string
): string {
  let todo = text;

  // Remove date words
  todo = todo.replace(
    /\b(today|tomorrow|yesterday)\b/gi,
    ""
  );

  // Remove priority words
  todo = todo.replace(
    /\b(low|medium|high|mandatory)\b/gi,
    ""
  );

  // Clean extra spaces
  todo = todo
    .replace(/\s+/g, " ")
    .trim();

  return todo;
}

export function parseTodoSpeech(
  transcript: string
): TodoFormState {
  const priority =
    extractPriority(transcript);

  const dateWord =
    extractDateWord(transcript);

  const todoText =
    extractTodoText(transcript);

  return {
    t: todoText,
    p: priority ?? "",
    da: dateWord
      ? getDateFromWord(dateWord)
      : "",
  };
}