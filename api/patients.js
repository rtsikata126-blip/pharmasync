/**
 * Patient data API — shared between Pharmacist Portal and Patient Portal.
 * Uses file-based persistence in data/patients.json.
 */

import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("./data");
const PATIENTS_FILE = path.join(DATA_DIR, "patients.json");

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

function readPatients() {
  ensureDataDir();
  try {
    if (fs.existsSync(PATIENTS_FILE)) {
      return JSON.parse(fs.readFileSync(PATIENTS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Failed to read patients file:", e);
  }
  return {};
}

function writePatients(data) {
  ensureDataDir();
  try {
    fs.writeFileSync(PATIENTS_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Failed to write patients file:", e);
  }
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function parseUrl(url) {
  if (!url) return { path: "/", query: {} };
  const [pathPart, queryString] = url.split("?");
  const query = {};
  if (queryString) {
    queryString.split("&").forEach((pair) => {
      const [k, v] = pair.split("=");
      query[decodeURIComponent(k)] = decodeURIComponent(v || "");
    });
  }
  return { path: pathPart, query };
}

export default async (req, res) => {
  // Set CORS headers so the patient portal (on a different subdomain) can access
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { path: urlPath } = parseUrl(req.url || "");
  const segments = urlPath.replace("/api/patients", "").replace(/^\/+/, "").split("/").filter(Boolean);
  const patientId = segments[0] || null;
  const subResource = segments[1] || null;

  // POST /api/patients — upsert a patient
  if (req.method === "POST" && !patientId) {
    try {
      const body = JSON.parse((await getBody(req)).toString());
      if (!body.id || !body.fullName) {
        return res.status(400).json({ error: "Patient id and fullName are required" });
      }
      const patients = readPatients();
      patients[body.id] = { ...patients[body.id], ...body };
      writePatients(patients);
      return res.json({ ok: true, patient: patients[body.id] });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  }

  // PUT /api/patients/:id — update a patient
  if (req.method === "PUT" && patientId) {
    try {
      const body = JSON.parse((await getBody(req)).toString());
      const patients = readPatients();
      patients[patientId] = { ...patients[patientId], ...body };
      writePatients(patients);
      return res.json({ ok: true, patient: patients[patientId] });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  }

  // DELETE /api/patients/:id — delete a patient
  if (req.method === "DELETE" && patientId) {
    try {
      const patients = readPatients();
      delete patients[patientId];
      writePatients(patients);
      return res.json({ ok: true });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  }

  // GET /api/patients — list all patients
  if (req.method === "GET" && !patientId) {
    try {
      const patients = readPatients();
      return res.json(Object.values(patients));
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  }

  // GET /api/patients/:id — get a single patient
  // GET /api/patients/:id/medications — get medications only
  if (req.method === "GET" && patientId) {
    try {
      const patients = readPatients();
      const patient = patients[patientId];
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      if (subResource === "medications") {
        return res.json(patient.medications || []);
      }
      if (subResource === "logs") {
        return res.json(patient.logs || []);
      }
      return res.json(patient);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(404).json({ error: "Not found" });
};
