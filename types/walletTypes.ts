export type ZapsTransactionType =
  | "EARN"
  | "SEND"
  | "RECEIVE"
  | "REDEEM"
  | "REFERRAL"
  | "SEASONAL_REWARD";

export interface ZapsLedgerEntry {
  id: string;
  userId: string;
  type: ZapsTransactionType;
  amount: number;
  counterpartyId?: string; // Who sent it / received it
  referenceId?: string; // postId, communityId, seasonId
  description?: string; // Human readable label
  createdAt: number;
}