
import { FeedPost } from "../../types/feedTypes";

export const getDemoFeed = (): FeedPost[] => [
  {
    id: "post-1",
    communityId: "design-systems",
    author: {
      id: "u1",
      name: "Sarah Jenkins",
      handle: "@designsarah",
      avatar: "https://picsum.photos/seed/sarah/200/200",
      tier: "Steward",
    },
    content: {
      text: "Just dropped a new module on Design Systems in Figma. Consistency compounds. 🎨",
      image: "https://picsum.photos/seed/ds1/800/500",
    },
    stats: {
      likes: 1240,
      comments: 86,
      zaps: 500,
    },
    createdAt: "2h ago",
  },
  {
    id: "post-2",
    communityId: "web3-builders",
    author: {
      id: "u2",
      name: "Alex Rivera",
      handle: "@arivera",
      avatar: "https://picsum.photos/seed/alex/200/200",
      tier: "Builder",
    },
    content: {
      text: "Analyzing the new L2 throughput benchmarks. The bridge latency is finally reaching a nominal state. ⛓️",
      image: "https://picsum.photos/seed/web3/800/500",
    },
    stats: {
      likes: 850,
      comments: 34,
      zaps: 120,
    },
    createdAt: "4h ago",
  },
  {
    id: "post-3",
    communityId: "zen-masters",
    author: {
      id: "u3",
      name: "Master Wei",
      handle: "@zenwei",
      avatar: "https://picsum.photos/seed/wei/200/200",
      tier: "Anchor",
    },
    content: {
      text: "True mastery is the subtraction of noise, not the addition of signal. Simplify your ritual today.",
    },
    stats: {
      likes: 3100,
      comments: 156,
      zaps: 850,
    },
    createdAt: "6h ago",
  },
];
