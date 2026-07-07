export type VersionBump = "none" | "patch" | "minor" | "major";

export function compareVersions(a: string, b: string) {
  const left = parseVersion(a);
  const right = parseVersion(b);

  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }

  return 0;
}

export function getNextVersion(currentVersion: string | null, bump: VersionBump) {
  if (!currentVersion) {
    return "1.0.0";
  }

  const [major, minor, patch] = parseVersion(currentVersion);

  if (bump === "major") {
    return `${major + 1}.0.0`;
  }

  if (bump === "minor") {
    return `${major}.${minor + 1}.0`;
  }

  if (bump === "patch") {
    return `${major}.${minor}.${patch + 1}`;
  }

  return currentVersion;
}

export function isValidVersion(value: string) {
  return /^\d+\.\d+\.\d+$/.test(value);
}

function parseVersion(value: string) {
  const parts = value.split(".").map((part) => Number(part));

  if (
    parts.length !== 3 ||
    parts.some((part) => !Number.isInteger(part) || part < 0)
  ) {
    throw new Error(`Invalid semantic version: ${value}`);
  }

  return parts as [number, number, number];
}
