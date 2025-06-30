import Database from 'better-sqlite3';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export interface Activity {
  id?: number;
  user: string;
  date: string; // YYYY-MM-DD
  activity: {
    status: 'complete' | 'progress' | 'upcoming';
    value: string;
  };
}

const REQUIRED_KEYS = ["clickup_list_id", "project_title", "listId"];

export class SqliteStorageProvider {
  private db: Database.Database;

  constructor(dbPath?: string) {
    // Opción 1: Usar directorio home del usuario
    const defaultPath = path.join(os.homedir(), '.mcp-activities', 'activities.db');
    
    // Opción 2: Usar directorio de datos de la aplicación
    // const defaultPath = path.join(os.homedir(), 'AppData', 'Local', 'mcp-activities', 'activities.db');
    
    const finalPath = dbPath || defaultPath;
    
    // Crear el directorio si no existe
    const dir = path.dirname(finalPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    console.log(`Using database at: ${finalPath}`);
    
    this.db = new Database(finalPath);
    this.createTable();
  }

  private createTable() {
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT NOT NULL,
        date TEXT NOT NULL,
        activity TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS project_metadata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project, key)
      )
    `).run();

    // Crear índices para mejor rendimiento
    this.db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user, date)
    `).run();
    
    this.db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date)
    `).run();
    
    this.db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_project_metadata_project ON project_metadata(project)
    `).run();
  }

  // Método para verificar la conexión y ubicación de la DB
  getDatabasePath(): string {
    return this.db.name;
  }

  // Método para hacer backup de la base de datos
  backup(backupPath?: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultBackupPath = path.join(
      path.dirname(this.db.name), 
      `activities_backup_${timestamp}.db`
    );
    const finalBackupPath = backupPath || defaultBackupPath;
    
    fs.copyFileSync(this.db.name, finalBackupPath);
    return finalBackupPath;
  }

  addActivity(activity: Activity): number {
    const result = this.db.prepare(
      'INSERT INTO activities (user, date, activity) VALUES (?, ?, ?)'
    ).run(activity.user, activity.date, JSON.stringify(activity.activity));
    return result.lastInsertRowid as number;
  }

  getActivitiesByDate(date: string): Activity[] {
    return this.db.prepare(
      'SELECT * FROM activities WHERE date = ? ORDER BY created_at DESC'
    ).all(date).map((a: any) => ({
      ...a,
      activity: (() => {
        try {
          const parsed = JSON.parse(a.activity);
          if (typeof parsed === "object" && parsed !== null && "status" in parsed && "value" in parsed) {
            return parsed;
          }
          return { status: "complete", value: parsed };
        } catch {
          return { status: "complete", value: a.activity };
        }
      })()
    })) as Activity[];
  }

  getActivitiesByUserAndDate(user: string, date: string): Activity[] {
    return this.db.prepare(
      'SELECT * FROM activities WHERE user = ? AND date = ? ORDER BY created_at DESC'
    ).all(user, date).map((a: any) => ({
      ...a,
      activity: (() => {
        try {
          const parsed = JSON.parse(a.activity);
          if (typeof parsed === "object" && parsed !== null && "status" in parsed && "value" in parsed) {
            return parsed;
          }
          return { status: "complete", value: parsed };
        } catch {
          return { status: "complete", value: a.activity };
        }
      })()
    })) as Activity[];
  }

  getAllActivities(): Activity[] {
    return this.db.prepare(
      'SELECT * FROM activities ORDER BY date DESC, created_at DESC'
    ).all().map((a: any) => ({
      ...a,
      activity: (() => {
        try {
          const parsed = JSON.parse(a.activity);
          if (typeof parsed === "object" && parsed !== null && "status" in parsed && "value" in parsed) {
            return parsed;
          }
          return { status: "complete", value: parsed };
        } catch {
          return { status: "complete", value: a.activity };
        }
      })()
    })) as Activity[];
  }

  getActivitiesByRange(startDate: string, endDate: string, name?: string): Activity[] {
    let query = 'SELECT * FROM activities WHERE date >= ? AND date <= ?';
    const params: any[] = [startDate, endDate];
    if (name) {
      query += ' AND LOWER(user) LIKE ?';
      params.push(`%${name.toLowerCase()}%`);
    }
    query += ' ORDER BY date DESC, created_at DESC';
    return this.db.prepare(query).all(...params).map((a: any) => ({
      ...a,
      activity: (() => {
        try {
          const parsed = JSON.parse(a.activity);
          if (typeof parsed === "object" && parsed !== null && "status" in parsed && "value" in parsed) {
            return parsed;
          }
          return { status: "complete", value: parsed };
        } catch {
          return { status: "complete", value: a.activity };
        }
      })()
    })) as Activity[];
  }

  // CRUD para metadatos de proyecto con timestamps
  setProjectMetadata(project: string, key: string, value: string): void {
    this.db.prepare(`
      INSERT OR REPLACE INTO project_metadata (project, key, value, updated_at) 
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(project, key, value);
  }

  getProjectMetadata(project: string, key: string): string | undefined {
    const row = this.db.prepare(
      'SELECT value FROM project_metadata WHERE project = ? AND key = ?'
    ).get(project, key) as { value?: string } | undefined;
    return row?.value;
  }

  getAllProjectMetadata(project: string): Record<string, string> {
    const rows = this.db.prepare(
      'SELECT key, value FROM project_metadata WHERE project = ? ORDER BY key'
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

  // Método para limpiar datos antiguos (opcional)
  cleanupOldActivities(daysToKeep: number = 365): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    
    const result = this.db.prepare(
      'DELETE FROM activities WHERE date < ?'
    ).run(cutoffDateStr);
    
    return result.changes;
  }

  // Cerrar la conexión de manera segura
  close(): void {
    this.db.close();
  }

  updateActivityById(id: number, fields: Partial<Omit<Activity, 'id'>>): void {
    const sets = [];
    const params: any[] = [];
    if (fields.user !== undefined) {
      sets.push('user = ?');
      params.push(fields.user);
    }
    if (fields.date !== undefined) {
      sets.push('date = ?');
      params.push(fields.date);
    }
    if (fields.activity !== undefined) {
      sets.push('activity = ?');
      params.push(JSON.stringify(fields.activity));
    }
    if (sets.length === 0) return;
    params.push(id);
    this.db.prepare(
      `UPDATE activities SET ${sets.join(', ')} WHERE id = ?`
    ).run(...params);
  }

  deleteActivityById(id: number): void {
    this.db.prepare(
      'DELETE FROM activities WHERE id = ?'
    ).run(id);
  }

  getProjectsByRange(startDate: string, endDate: string): string[] {
    const rows = this.db.prepare(
      'SELECT DISTINCT user FROM activities WHERE date >= ? AND date <= ? ORDER BY user ASC'
    ).all(startDate, endDate) as { user: string }[];
    return rows.map(r => r.user);
  }
}