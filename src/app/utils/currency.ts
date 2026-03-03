export function getRandomAmount(): number {
  return Math.floor(Math.random() * 100) + 1;
}

export function formatCurrency(amount: number): string {
  return `€${amount.toFixed(2)}`;
}
