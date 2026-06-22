/**
 * Shared storage abstraction.
 *
 * In production (Vercel):  uses Vercel KV (Redis) via the @vercel/kv client.
 * In development (local):  falls back to file-based JSON in the data/ directory.
 *
 * Environment variable detection:
 *   KV_URL or KV_REST_API_URL set → Vercel KV mode
 *   neither set                  → local file mode
 */

import fs from "fs";
import path from "path";
import { kv } from "@vercel/kv";

const DATA_DIR = path.resolve("./data");

/**
 * True when the Vercel KV runtime env vars (KV_REST_API_URL + KV_REST_API_TOKEN)
 * are present. In local dev these won't be set, so we fall back to file storage.
 */
function isKvAvailable() {
  return !!(process.env.KV_REST_API_URL || process.env.KV_URL);
}

// ── Local file helpers ───────────────────────────────────────────
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

function filePath(key) {
  return path.join(DATA_DIR, `${key}.json`);
}

function readFile(key) {
  ensureDataDir();
  const fp = filePath(key);
  try {
    if (fs.existsSync(fp)) {
      return JSON.parse(fs.readFileSync(fp, "utf-8"));
    }
  } catch (e) {
    console.error(`[storage] Failed to read file "${key}":`, e);
  }
  return null;
}

function writeFile(key, data) {
  ensureDataDir();
  try {
    fs.writeFileSync(filePath(key), JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`[storage] Failed to write file "${key}":`, e);
  }
}

// ── Public API ───────────────────────────────────────────────────

/**
 * Read a JSON value by key.
 * Returns null if the key does not exist.
 */
export async function readJSON(key) {
  if (isKvAvailable()) {
    try {
      return await kv.get(key);
    } catch (e) {
      console.error(`[storage] KV read error for "${key}":`, e);
      return null;
    }
  }
  return readFile(key);
}

/**
 * Write a JSON value by key.
 */
export async function writeJSON(key, data) {
  if (isKvAvailable()) {
    try {
      await kv.set(key, data);
      return;
    } catch (e) {
      console.error(`[storage] KV write error for "${key}":`, e);
    }
  }
  writeFile(key, data);
}

/**
 * Delete a key.
 */
export async function deleteKey(key) {
  if (isKvAvailable()) {
    try {
      await kv.del(key);
      return;
    } catch (e) {
      console.error(`[storage] KV delete error for "${key}":`, e);
    }
  }
  const fp = filePath(key);
  try {
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  } catch (e) {
    console.error(`[storage] Failed to delete file "${key}":`, e);
  }
}
