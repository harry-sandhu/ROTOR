import type { CompatibilityEvaluation } from "@rotor/contracts";

export function toBuildEvaluationSnapshot(buildId: string, evaluation: CompatibilityEvaluation) {
  return {
    buildId,
    compatibilityScore: evaluation.score,
    validationStatus: evaluation.validationStatus,
    totalCostCents: evaluation.totalCostCents,
    missingCategories: evaluation.missingCategories,
    warnings: evaluation.issues.filter((issue) => issue.status === "WARNING") as Record<string, unknown>[],
    issues: evaluation.issues as Record<string, unknown>[],
  };
}

export function fromBuildEvaluationSnapshot(snapshot: {
  compatibilityScore: number;
  validationStatus: CompatibilityEvaluation["validationStatus"];
  totalCostCents: number;
  missingCategories: string[];
  issues: Record<string, unknown>[];
}) {
  const issues = snapshot.issues as CompatibilityEvaluation["issues"];

  return {
    overallStatus: issues.some((issue) => issue.status === "INCOMPATIBLE")
      ? "INCOMPATIBLE"
      : issues.some((issue) => issue.status === "WARNING")
        ? "WARNING"
        : "COMPATIBLE",
    validationStatus: snapshot.validationStatus,
    score: snapshot.compatibilityScore,
    totalCostCents: snapshot.totalCostCents,
    missingCategories: snapshot.missingCategories,
    issues,
    checks: [],
  } satisfies CompatibilityEvaluation;
}
