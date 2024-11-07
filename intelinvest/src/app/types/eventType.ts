export type EventType = {
  date: string;
  amountPerShare: string;
  cleanAmountPerShare: string | null;
  quantity: string;
  portfolioId: string | null;
  executed: boolean;
  comment: string | null;
  tax: string | null;
  cleanAmount: string;
  totalAmount: string;
  totalAmountOriginal: string;
  label: string;
  period: string | null;
  type: string;
};
