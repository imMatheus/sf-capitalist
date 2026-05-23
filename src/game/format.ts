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
  "quattuordecillion",
  "quindecillion",
  "sexdecillion",
  "septendecillion",
  "octodecillion",
  "novemdecillion",
  "vigintillion",
  "unvigintillion",
  "duovigintillion",
  "tresvigintillion",
  "quattuorvigintillion",
  "quinvigintillion",
  "sexvigintillion",
  "septenvigintillion",
  "octovigintillion",
  "novemvigintillion",
  "trigintillion",
  "untrigintillion",
  "duotrigintillion",
  "tretrigintillion",
  "quattuortrigintillion",
  "quintrigintillion",
  "sextrigintillion",
  "septentrigintillion",
  "octotrigintillion",
  "novemtrigintillion",
  "quadragintillion",
  "unquadragintillion",
  "duoquadragintillion",
  "trequadragintillion",
  "quattuorquadragintillion",
  "quinquadragintillion",
  "sexquadragintillion",
  "septenquadragintillion",
  "octoquadragintillion",
  "novemquadragintillion",
  "quinquagintillion",
  "unquinquagintillion",
  "duoquinquagintillion",
  "trequinquagintillion",
  "quattuorquinquagintillion",
  "quinquinquagintillion",
  "sexquinquagintillion",
  "septenquinquagintillion",
  "octoquinquagintillion",
  "novemquinquagintillion",
  "sexagintillion",
  "unsexagintillion",
  "duosexagintillion",
  "tresexagintillion",
  "quattuorsexagintillion",
  "quinsexagintillion",
  "sexsexagintillion",
  "septensexagintillion",
  "octosexagintillion",
  "novemsexagintillion",
  "septuagintillion",
  "unseptuagintillion",
  "duoseptuagintillion",
  "treseptuagintillion",
  "quattuorseptuagintillion",
  "quinseptuagintillion",
  "sexseptuagintillion",
  "septseptuagintillion",
  "octoseptuagintillion",
  "novemseptuagintillion",
  "octogintillion",
  "unoctogintillion",
  "duooctogintillion",
  "treoctogintillion",
  "quattuoroctogintillion",
  "quinoctogintillion",
  "sexoctogintillion",
  "septoctogintillion",
  "octooctogintillion",
  "novemoctogintillion",
  "nonagintillion",
  "unnonagintillion",
  "duononagintillion",
  "trenonagintillion",
  "quattuornonagintillion",
  "quinnonagintillion",
  "sexnonagintillion",
  "septnonagintillion",
  "octononagintillion",
  "novemnonagintillion",
  "centillion",
  "uncentillion",
] as const;

const GOOGOL_TIER = 33;
const GOOGOL = 10 ** 100;

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

  const rawTier = Math.floor(Math.log10(absolute) / 3);

  if (rawTier >= shortScale.length) {
    return value.toExponential(2);
  }

  const tier = rawTier;
  const scaled = value / 1_000 ** tier;
  const suffix =
    tier === GOOGOL_TIER && Math.abs(absolute / GOOGOL - 1) < 1e-12
      ? `${shortScale[tier]} (Googol)`
      : shortScale[tier];

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
