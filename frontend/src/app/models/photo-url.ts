export function normalizePhotoUrl(value?: string): string {
  const trimmed = value?.trim() || "";
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);

    if (url.hostname.includes("google.") && url.pathname === "/imgres") {
      return url.searchParams.get("imgurl") || trimmed;
    }

    if (url.hostname === "github.com" && url.pathname.includes("/blob/")) {
      url.hostname = "raw.githubusercontent.com";
      url.pathname = url.pathname.replace("/blob/", "/");
      return url.toString();
    }

    return url.toString();
  } catch {
    return trimmed;
  }
}
