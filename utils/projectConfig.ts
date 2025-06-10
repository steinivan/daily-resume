import { SqliteStorageProvider } from "../sqliteStorageProvider.js";

const REQUIRED_KEYS = ["clickup_list_id", "project_title", "listId"];

export function checkProjectConfig(project: string): { missing: string[], metadata: Record<string, string> } {
    const db = new SqliteStorageProvider();
    const metadata = db.getAllProjectMetadata(project);
    const missing = REQUIRED_KEYS.filter(key => !metadata[key]);
    return { missing, metadata };
} 