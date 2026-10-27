/**
 * Parses an amount typed by a user (`1,250.50`, `-80`) into minor units.
 * Returns null when the input is not a number with at most two decimals.
 */
export const parseAmountInput = (input: string) => {
  const normalized = input.replaceAll(/[\s,]/g, '');
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [units = '0', cents = ''] = normalized.replace('-', '').split('.');
  const amount = Number(units) * 100 + Number(cents.padEnd(2, '0'));

  return normalized.startsWith('-') ? -amount : amount;
};

/** Minor units to the plain decimal string an input field expects. */
export const toAmountInput = (amount: number) => (amount / 100).toFixed(2);
