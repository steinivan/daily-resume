import Database from 'better-sqlite3';

export interface Activity {
  id?: number;
  user: string;
  date: string; // YYYY-MM-DD
  activity: string;
}

const REQUIRED_KEYS = ["clickup_list_id", "project_title", "listId"];

export class SqliteStorageProvider {
  private db: Database.Database;

  constructor(dbPath: string = 'activities.db') {
    this.db = new Database(dbPath);
    this.createTable();
  }

  private createTable() {
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT NOT NULL,
        date TEXT NOT NULL,
        activity TEXT NOT NULL
      )
    `).run();
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS project_metadata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        UNIQUE(project, key)
      )
    `).run();
  }

  addActivity(activity: Activity): void {
    this.db.prepare(
      'INSERT INTO activities (user, date, activity) VALUES (?, ?, ?)'
    ).run(activity.user, activity.date, activity.activity);
  }

  getActivitiesByDate(date: string): Activity[] {
    return this.db.prepare(
      'SELECT * FROM activities WHERE date = ?'
    ).all(date) as Activity[];
  }

  getActivitiesByUserAndDate(user: string, date: string): Activity[] {
    return this.db.prepare(
      'SELECT * FROM activities WHERE user = ? AND date = ?'
    ).all(user, date) as Activity[];
  }

  getAllActivities(): Activity[] {
    return this.db.prepare('SELECT * FROM activities').all() as Activity[];
  }

  getActivitiesByRange(startDate: string, endDate: string, name?: string): Activity[] {
    let query = 'SELECT * FROM activities WHERE date >= ? AND date <= ?';
    const params: any[] = [startDate, endDate];
    if (name) {
      query += ' AND LOWER(user) LIKE ?';
      params.push(`%${name.toLowerCase()}%`);
    }
    return this.db.prepare(query).all(...params) as Activity[];
  }

  // CRUD para metadatos de proyecto
  setProjectMetadata(project: string, key: string, value: string): void {
    this.db.prepare(
      'INSERT OR REPLACE INTO project_metadata (project, key, value) VALUES (?, ?, ?)' 
    ).run(project, key, value);
  }

  getProjectMetadata(project: string, key: string): string | undefined {
    const row = this.db.prepare(
      'SELECT value FROM project_metadata WHERE project = ? AND key = ?'
    ).get(project, key) as { value?: string } | undefined;
    return row && row.value ? row.value : undefined;
  }

  getAllProjectMetadata(project: string): Record<string, string> {
    const rows = this.db.prepare(
      'SELECT key, value FROM project_metadata WHERE project = ?'
    ).all(project) as { key: string, value: string }[];
    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  }

  deleteProjectMetadata(project: string, key: string): void {
    this.db.prepare(
      'DELETE FROM project_metadata WHERE project = ? AND key = ?'
    ).run(project, key);
  }
} 