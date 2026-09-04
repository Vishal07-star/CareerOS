// src/frontend/Recruiter/recruiterStorage.js

import LZString from "lz-string";

const STORAGE_KEY = "careerOS_recruiter_data_v3";

// Keys written by older versions of the app, in descending version order.
// loadState() will attempt to migrate data from these if _v3 is missing.
const LEGACY_KEYS = ["careerOS_recruiter_data_v2", "careerOS_recruiter_data_v1"];

// Default fallback state
const defaultState = {
  jobs: [],
  candidates: [],
  interviews: [],
  messages: [],
  notifications: [],
  activity: [],
  hiringAlerts: [],
  settings: {},
};

/**
 * Attempt to parse a raw localStorage value that may be:
 *   1. LZString-compressed JSON  (written by a v2/v3 build that had compression)
 *   2. Plain JSON string          (written by an earlier build without compression)
 * Returns the parsed object, or null if neither format works.
 */
function tryParse(raw) {
  if (!raw) return null;
  // Try LZString first
  try {
    const json = LZString.decompressFromUTF16(raw);
    if (json) return JSON.parse(json);
  } catch (_) { /* not compressed */ }
  // Fallback: plain JSON
  try {
    return JSON.parse(raw);
  } catch (_) { /* not valid JSON either */ }
  return null;
}

/**
 * One-time migration: if _v3 is absent, walk the legacy key list and try to
 * recover data from an older key. On success, write it under _v3 and remove
 * the old key so subsequent loads are fast and storage is not duplicated.
 */
function migrate() {
  for (const oldKey of LEGACY_KEYS) {
    const raw = localStorage.getItem(oldKey);
    if (!raw) continue;
    const parsed = tryParse(raw);
    if (parsed && typeof parsed === "object") {
      console.info(`[recruiterStorage] Migrating data from ${oldKey} to ${STORAGE_KEY}`);
      saveState(parsed);
      try { localStorage.removeItem(oldKey); } catch (_) { /* ignore */ }
      return parsed;
    }
  }
  return null;
}

/**
 * Load recruiter state from localStorage with LZString decompression.
 * If the current key is absent, attempts a one-time migration from legacy keys.
 * Returns the parsed state object or the default fallback.
 */
export function loadState() {
  try {
    const compressed = localStorage.getItem(STORAGE_KEY);
    if (compressed) {
      const json = LZString.decompressFromUTF16(compressed);
      if (json) return JSON.parse(json);
    }
    // _v3 is missing — attempt legacy migration before giving up
    const migrated = migrate();
    if (migrated) return migrated;
  } catch (error) {
    console.error("[recruiterStorage] Could not load recruiter data:", error);
  }
  return defaultState;
}

/**
 * Save recruiter state to localStorage with LZString compression.
 *
 * resumeDataUrl on candidate records is session-only — it is a base64 blob
 * that can be several MB and will quickly exceed the ~5 MB localStorage
 * quota. Strip it before persisting (same rule as the candidate side).
 * The dataUrl stays in React state for the current session so download links
 * work; after a refresh the drawer shows the "session only" message instead.
 *
 * Wraps in try/catch to gracefully handle QuotaExceededError.
 */
export function saveState(state) {
  try {
    const stripped = {
      ...state,
      candidates: (state.candidates || []).map(
        ({ resumeDataUrl: _resumeDataUrl, ...rest }) => rest
      ),
    };
    const json = JSON.stringify(stripped);
    const compressed = LZString.compressToUTF16(json);
    localStorage.setItem(STORAGE_KEY, compressed);
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.warn("[recruiterStorage] localStorage quota exceeded — recruiter state could not be saved.");
    } else {
      console.error("[recruiterStorage] Could not save recruiter data:", error);
    }
  }
}
