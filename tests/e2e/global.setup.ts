import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export default async function globalSetup() {
  const reportDirectory = path.join(process.cwd(), "test-results");
  await mkdir(reportDirectory, { recursive: true });
  await writeFile(
    path.join(reportDirectory, "a11y-report.json"),
    JSON.stringify(
      {
        note: "Detailed axe output is attached to the Playwright test result.",
      },
      null,
      2,
    ),
  );
}
