
import { MessageThread } from "../../types/messageTypes";

export const getDemoThreads = (): MessageThread[] => [
  {
    id: "t1",
    participant: {
      name: "Elena R.",
      avatar: "https://picsum.photos/seed/elena/100/100",
    },
    lastMessage: "Loved your post on governance design.",
    unread: true,
    time: "2m ago",
  },
  {
    id: "t2",
    participant: {
      name: "David K.",
      avatar: "https://picsum.photos/seed/david/100/100",
    },
    lastMessage: "Let’s collaborate next week.",
    unread: false,
    time: "1h ago",
  },
];
