const shortScale = [
  "",
  "thousand",
  "million",
  "billion",
  "trillion",
  "quadrillion",
  "quintillion",
  "sextillion",
  "septillion",
  "octillion",
  "nonillion",
  "decillion",
  "undecillion",
  "duodecillion",
  "tredecillion",
];

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const formatCompact = (value: number, fractionDigits = 2): string => {
  if (!Number.isFinite(value)) {
    return "Infinity";
  }

  const absolute = Math.abs(value);

  if (absolute < 1_000) {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: absolute < 100 ? fractionDigits : 0,
    });
  }

  const tier = Math.min(Math.floor(Math.log10(absolute) / 3), shortScale.length - 1);
  const scaled = value / 1_000 ** tier;
  const suffix = shortScale[tier];

  if (tier >= shortScale.length - 1 && absolute >= 1_000 ** tier * 1_000) {
    return value.toExponential(2);
  }

  return `${scaled.toLocaleString("en-US", {
    maximumFractionDigits: scaled >= 100 ? 0 : fractionDigits,
  })} ${suffix}`.trim();
};

export const formatMoney = (value: number) => `$${formatCompact(value)}`;

export const formatLevel = (value: number) => String(Math.trunc(value));

export const formatDuration = (seconds: number): string => {
  if (seconds < 1) {
    return `${Math.max(0.05, seconds).toFixed(2)}s`;
  }

  const rounded = Math.floor(seconds);
  const hours = Math.floor(rounded / 3_600);
  const minutes = Math.floor((rounded % 3_600) / 60);
  const secs = rounded % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }

  return `${secs}s`;
};

export const formatMultiplier = (value: number) => `x${formatCompact(value, 1)}`;
