import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// For __dirname compatibility in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the JSON file manually
const serviceAccountKeyPath = path.join(__dirname, "serviceAccountKey.json");
const serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountKeyPath, "utf8"));

const app = initializeApp({
  credential: cert(serviceAccountKey),
});

const auth = getAuth(app);
export default auth;
