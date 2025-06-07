const CLOCKIFY_API_KEY = process.env.CLOCKIFY_API_KEY || '';
const CLOCKIFY_API_BASE = "https://api.clockify.me/api/v1";

export function getClockifyHeaders() {
    return {
        "X-Api-Key": CLOCKIFY_API_KEY,
        "Content-Type": "application/json",
        accept: "application/json"
    };
}

export function buildQueryString(params: Record<string, any> = {}) {
    if (!params || Object.keys(params).length === 0) return "";
    const query = Object.entries(params).reduce((acc, [key, value]) => {
        if (Array.isArray(value)) {
            acc[key] = value.join(",");
        } else if (typeof value === "boolean") {
            acc[key] = value ? "true" : "false";
        } else if (value !== undefined && value !== null) {
            acc[key] = value.toString();
        }
        return acc;
    }, {} as Record<string, string>);
    return "?" + new URLSearchParams(query).toString();
}

export async function fetchClockify(endpoint: string, params?: Record<string, any>) {
    const url = `${CLOCKIFY_API_BASE}${endpoint}${buildQueryString(params)}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: getClockifyHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Clockify API error:", error);
        return null;
    }
} 