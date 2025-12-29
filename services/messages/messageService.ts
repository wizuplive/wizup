
import { isDemo } from "../../config/appMode";
import { getDemoThreads } from "./messageService.demo";
import { MessageThread } from "../../types/messageTypes";

export const messageServiceRouter = {
  async getThreads(): Promise<MessageThread[]> {
    if (isDemo()) return getDemoThreads();
    return [];
  }
};
