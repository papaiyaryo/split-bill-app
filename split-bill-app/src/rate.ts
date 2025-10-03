import type { Currency, Rates } from "./domain";
import { getLS, setLS } from "./storage";

const FX_CACHE_KEY = "fx:JPY";
const FX_TTL_MS = 24 * 60 * 60 * 1000;
const API_URL =
  "https://api.frankfurter.dev/v1/latest?base=JPY&symbols=USD,EUR,RON";

type RatesCache = {
  updatedAt: number;
  rates: Rates;
};

const REQUIRED: Currency[] = ["USD", "EUR", "RON", "JPY"];

function hasRequired(r: Rates): boolean {
  if (r.base !== "JPY") return false;
  return REQUIRED.every((c) => Number.isFinite(r.rates[c]));
}

export async function fetchRatesJPY(force?: false): Promise<Rates> {
  const cached = getLS<RatesCache | null>(FX_CACHE_KEY, null);

  if (
    !force &&
    cached &&
    Date.now() - cached.updatedAt < FX_TTL_MS &&
    hasRequired(cached.rates)
  ) {
    return cached.rates;
  }
  const res = await fetch(API_URL);
  if (!res.ok) {
    if (cached && hasRequired(cached.rates)) return cached.rates;
    throw new Error(`FX fetch failed: ${res.status}`);
  }
  const data: {date:string;base:string;rates:Record<string,number>}=await res.json();

  const normalized: Rates = {
    base: "JPY",
    date: data.date,
    rates:{
        JPY:1,
        USD:data.rates.USD,
        EUR:data.rates.EUR,
        RON:data.rates.RON,
    }as Record<Currency,number>,
  }
  if (!hasRequired(normalized)) {
    if (cached && hasRequired(cached.rates)) return cached.rates;
    throw new Error("FX response missing required currencies");
  }

  setLS<RatesCache>(FX_CACHE_KEY, { updatedAt: Date.now(), rates: normalized });
  return normalized;
}

