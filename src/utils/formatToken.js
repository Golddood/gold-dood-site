export function formatTokenBalance(rawBalance) {
  const num = parseFloat(rawBalance);
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(3).replace(/\.0+$/, '') + 'T';
  } else if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(3).replace(/\.0+$/, '') + 'B';
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(3).replace(/\.0+$/, '') + 'M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(3).replace(/\.0+$/, '') + 'K';
  } else {
    return rawBalance;
  }
}
