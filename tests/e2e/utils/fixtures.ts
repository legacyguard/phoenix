import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// ES module compatible directory resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const FIXTURES_PATH = join(__dirname, "../../fixtures");

export function getFixturePath(filename: string): string {
  return join(FIXTURES_PATH, filename);
}
