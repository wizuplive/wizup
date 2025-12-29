
export interface MessageThread {
  id: string;
  participant: {
    name: string;
    avatar: string;
  };
  lastMessage: string;
  unread: boolean;
  time: string;
}
