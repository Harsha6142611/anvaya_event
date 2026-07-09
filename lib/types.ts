export type EntryType = "sponsor" | "expenditure" | "due";

export type Entry = {
  id: string;
  name: string;
  reason: string;
  amount: number;
  type: EntryType;
  created_at: number;
};

export type CreateEntryInput = {
  name: string;
  reason: string;
  amount: number;
  type: EntryType;
  pin: string;
};
