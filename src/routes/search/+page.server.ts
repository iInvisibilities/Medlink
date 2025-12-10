import type { ServerLoad } from "@sveltejs/kit";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { getDoctors } from "$lib/server/userData";

const searchRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 30
});

export const load: ServerLoad = async ({ url, getClientAddress }) => {
  const specialty = (url.searchParams.get("specialty") || "").trim();
  const location = (url.searchParams.get("location") || "").trim();
  const dateStr = (url.searchParams.get("date") || "").trim();

  const hasFilters = Boolean(specialty || location || dateStr);

  let clinics: any[] = [];
  let dateFilterApplied = false;
  let normalizedDate = dateStr;
  let rateLimited = false;
  let retrySeconds = 0;

  if (hasFilters) {
    const ip = getClientAddress?.() || "unknown";

    try {
      await searchRateLimiter.consume(ip);
    } catch (rateError: any) {
      rateLimited = true;
      retrySeconds = Math.ceil((rateError?.msBeforeNext || 0) / 1000) || 30;
    }

    const docs = rateLimited
      ? []
      : await getDoctors(
          {
            specialty: specialty || undefined,
            city: location || undefined
          },
          50
        );

    let filtered = docs;

    if (dateStr) {
      const dt = new Date(dateStr);
      if (!isNaN(dt.getTime())) {
        const weekday = dt.getDay();
        filtered = docs.filter((doc: any) =>
          Array.isArray(doc.open_hours) &&
          doc.open_hours.some((h: any) => Number(h.day) === weekday)
        );
        dateFilterApplied = true;
        normalizedDate = dt.toISOString().slice(0, 10);
      }
    }

    const deepSerialize = (value: any): any => {
      if (value == null) return value;
      if (value instanceof Date) return value.toISOString();
      if (typeof value === "object") {
        if (typeof (value as any).toHexString === "function") return (value as any).toHexString();
        if (typeof (value as any).toString === "function" && (value.constructor?.name === "ObjectId")) {
          return (value as any).toString();
        }
        if (Array.isArray(value)) return value.map(deepSerialize);
        const out: any = {};
        for (const [k, v] of Object.entries(value)) out[k] = deepSerialize(v);
        return out;
      }
      return value;
    };

    clinics = deepSerialize(filtered);
  }

  return {
    filters: { specialty, location, date: normalizedDate },
    clinics,
    hasFilters,
    dateFilterApplied,
    rateLimited,
    retrySeconds
  };
};
