
export interface Community {
  id: string;
  name: string;
  members: number;
  activity: "Active" | "Quiet" | "Forming";
  role: "Member" | "Creator" | "Influencer";
  image: string;
  description: string;
}
