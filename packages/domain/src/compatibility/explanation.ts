import { describeComparableValue } from "./operators.js";

export function renderRuleMessage(
  template: string,
  context: {
    fromCategory: string;
    toCategory: string;
    leftSpec: string;
    rightSpec: string;
    leftValue: unknown;
    rightValue: unknown;
  },
): string {
  return template
    .replaceAll("{fromCategory}", context.fromCategory)
    .replaceAll("{toCategory}", context.toCategory)
    .replaceAll("{leftSpec}", context.leftSpec)
    .replaceAll("{rightSpec}", context.rightSpec)
    .replaceAll("{leftValue}", describeComparableValue(context.leftValue as never))
    .replaceAll("{rightValue}", describeComparableValue(context.rightValue as never));
}
