import type { CompatibilityEvaluation, CompatibilityStatus } from "./types.js";

export function deriveCandidateStatus(
  evaluation: CompatibilityEvaluation,
  candidateCategory: string,
): { status: CompatibilityStatus; reasons: string[] } {
  const relevantIssues = evaluation.issues.filter((issue) => issue.categories.includes(candidateCategory));

  if (relevantIssues.some((issue) => issue.status === "INCOMPATIBLE")) {
    return {
      status: "INCOMPATIBLE",
      reasons: relevantIssues.filter((issue) => issue.status === "INCOMPATIBLE").map((issue) => issue.message),
    };
  }

  if (relevantIssues.some((issue) => issue.status === "WARNING")) {
    return {
      status: "WARNING",
      reasons: relevantIssues.filter((issue) => issue.status === "WARNING").map((issue) => issue.message),
    };
  }

  return {
    status: "COMPATIBLE",
    reasons: [],
  };
}
