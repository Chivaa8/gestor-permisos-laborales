const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(value) {
  return EMAIL_REGEX.test(normalizeEmail(value));
}

export function normalizePhotoUrl(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);

    if (url.hostname.includes("google.") && url.pathname === "/imgres") {
      return url.searchParams.get("imgurl") || trimmed;
    }

    if (url.hostname === "github.com" && url.pathname.includes("/blob/")) {
      url.hostname = "raw.githubusercontent.com";
      url.pathname = url.pathname.replace("/blob/", "/");
    }

    return url.toString();
  } catch {
    return trimmed;
  }
}
