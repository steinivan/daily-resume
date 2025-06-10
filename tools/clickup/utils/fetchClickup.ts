const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY || '';
const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

export function getClickupHeaders() {
    return {
        accept: "application/json",
        Authorization: CLICKUP_API_KEY
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

export async function fetchClickup(endpoint: string, params?: Record<string, any>) {
    const url = `${CLICKUP_API_BASE}${endpoint}${buildQueryString(params)}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: getClickupHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        return null;
    }
} 