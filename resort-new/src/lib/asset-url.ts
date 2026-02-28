const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api/v1";

function getApiOrigin(baseUrl: string) {
    return baseUrl.replace(/\/api\/v1\/?$/, "");
}

export function resolveImageUrl(url?: string | null) {
    if (!url) return undefined;

    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("//")) return `https:${url}`;
    if (url.startsWith("www.")) return `https://${url}`;

    if (url.startsWith("/uploads/")) {
        return `${getApiOrigin(API_BASE_URL)}${url}`;
    }

    return url;
}