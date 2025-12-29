
import { Community } from "../../types/communityTypes";

export const getDemoCommunities = (): Community[] => [
  {
    id: "design-systems",
    name: "Design Systems",
    members: 12400,
    activity: "Active",
    role: "Creator",
    image: "https://picsum.photos/seed/ds/400/400",
    description: "The ultimate resource for scaling design."
  },
  {
    id: "web3-builders",
    name: "Web3 Builders",
    members: 8100,
    activity: "Quiet",
    role: "Member",
    image: "https://picsum.photos/seed/web3/400/400",
    description: "Building the decentralized web."
  },
  {
    id: "zen-masters",
    name: "Zen Masters",
    members: 2500,
    activity: "Active",
    role: "Influencer",
    image: "https://picsum.photos/seed/zen/400/400",
    description: "Pathways to presence."
  },
];
