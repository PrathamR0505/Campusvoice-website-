import fs from 'fs';
import path from 'path';
import os from 'os';

// Store permanently outside the repository directory so nodemon never restarts when reports are deleted
const DELETED_REPORTS_FILE = path.join(os.tmpdir(), 'campusvoice_deleted_reports.json');
const memoryDeletedSet = new Set();
let initialized = false;

function initStore() {
  if (initialized) return;
  initialized = true;

  // 1. Try reading from persistent temp file
  try {
    if (fs.existsSync(DELETED_REPORTS_FILE)) {
      const data = fs.readFileSync(DELETED_REPORTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        parsed.forEach((id) => memoryDeletedSet.add(id));
      }
    }
  } catch (e) {
    console.warn('Could not read temp deleted reports file:', e.message);
  }

  // 2. Also import from any legacy local deleted_reports.json if present and remove it
  try {
    const legacyPath = path.resolve('deleted_reports.json');
    if (fs.existsSync(legacyPath)) {
      const data = fs.readFileSync(legacyPath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        parsed.forEach((id) => memoryDeletedSet.add(id));
      }
      try {
        fs.unlinkSync(legacyPath);
      } catch (err) {
        // ignore unlink error
      }
    }
  } catch (e) {
    // ignore
  }

  // Save merged set to persistent disk file
  saveToDisk();
}

function saveToDisk() {
  try {
    fs.writeFileSync(DELETED_REPORTS_FILE, JSON.stringify(Array.from(memoryDeletedSet), null, 2));
  } catch (e) {
    console.error('Could not save deleted reports to temp disk:', e.message);
  }
}

export const getDeletedReportIds = () => {
  initStore();
  return new Set(memoryDeletedSet);
};

export const addDeletedReportId = (id) => {
  if (!id) return;
  initStore();
  memoryDeletedSet.add(id);
  saveToDisk();
};

export const removeDeletedReportId = (id) => {
  if (!id) return;
  initStore();
  memoryDeletedSet.delete(id);
  saveToDisk();
};
