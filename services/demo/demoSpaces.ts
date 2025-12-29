export type SpaceSummary = { id: string; name: string; status?: "ACTIVE" | "QUIET" };

export const demoSpaces: SpaceSummary[] = [
  { id: "Design Systems Mastery", name: "Design Systems Mastery", status: "ACTIVE" },
  { id: "Web3 Builders Club", name: "Web3 Builders Club", status: "QUIET" },
  { id: "Minimalist Productivity", name: "Minimalist Productivity", status: "ACTIVE" },
];