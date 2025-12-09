import type { LayoutServerLoad } from "./$types";
import { getLanguageContent } from "$lib/server/language";

export const load: LayoutServerLoad = async ({ locals, url, cookies }) => {
  const validLangs = new Set(["en", "fr", "ar"]);

  const fromQuery = url.searchParams.get("lang") || undefined;
  const fromCookie = cookies.get("lang") || undefined;

  let language = fromQuery || fromCookie || "en";
  if (!validLangs.has(language)) language = "en";

  // If language came from the query param, persist it in a cookie
  if (fromQuery && fromQuery !== fromCookie && validLangs.has(fromQuery)) {
    cookies.set("lang", fromQuery, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });
  }

  const content = getLanguageContent(language);

  return {
    session: locals.session,
    language,
    content
  };
};
