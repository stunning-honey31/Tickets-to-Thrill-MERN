/**
 * Simulated refund policy, applied whenever a booking is cancelled
 * (by the customer or by an admin):
 *   - visit date already passed        -> no refund (0%)
 *   - cancelled 24h+ before visit date -> full refund (100%)
 *   - cancelled within 24h of visit    -> partial refund (50%)
 * No real payment gateway is wired up here, so this only calculates
 * the amount and records it on the booking - it doesn't move any
 * actual money.
 */
function calculateRefund(lineTotal, visitDate) {
  const now = new Date();
  const msUntilVisit = new Date(visitDate).getTime() - now.getTime();
  const hoursUntilVisit = msUntilVisit / (1000 * 60 * 60);

  if (hoursUntilVisit < 0) return { amount: 0, rate: 0 };
  if (hoursUntilVisit >= 24) return { amount: lineTotal, rate: 1 };
  return { amount: Math.round(lineTotal * 0.5 * 100) / 100, rate: 0.5 };
}

module.exports = { calculateRefund };
