export function formatRupee(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function computeBalance(entries: { amount: number; type: string }[]) {
  let sponsors = 0;
  let expenditures = 0;
  let dues = 0;

  for (const entry of entries) {
    if (entry.type === "sponsor") sponsors += entry.amount;
    else if (entry.type === "expenditure") expenditures += entry.amount;
    else if (entry.type === "due") dues += entry.amount;
  }

  return {
    sponsors,
    expenditures,
    dues,
    balance: sponsors - expenditures,
  };
}
