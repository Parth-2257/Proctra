import assert from "node:assert";
import { DEFAULT_QUESTIONS } from "./src/data/questions.js";

// Verify questions integrity
assert(Array.isArray(DEFAULT_QUESTIONS), "Questions must be an array");
assert(DEFAULT_QUESTIONS.length >= 8, "Expected at least 8 questions");

for (const q of DEFAULT_QUESTIONS) {
  assert(typeof q.id === "number", `Question ${q.id} missing id`);
  assert(typeof q.question === "string" && q.question.length > 0, `Question ${q.id} missing text`);
  assert(Array.isArray(q.options) && q.options.length >= 2, `Question ${q.id} must have >= 2 options`);
  assert(typeof q.correctAnswer === "number", `Question ${q.id} must have correct answer index`);
  assert(q.correctAnswer >= 0 && q.correctAnswer < q.options.length, `Question ${q.id} invalid answer index`);
}

console.log("✓ Self-check passed: All questions verified correctly.");
