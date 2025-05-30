import Database from 'better-sqlite3';

export interface Activity {
  id?: number;
  user: string;
  date: string; // YYYY-MM-DD
  activity: string;
}

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
} 