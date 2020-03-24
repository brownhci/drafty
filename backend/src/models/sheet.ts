const csProfessorName = "CS Professors";
const csProfessorURL = "professors";
const csProfessorPath = "sheets/professors";
const academicJobName = "Academic Jobs";
const academicJobURL = "ajobs";
const academicJobPath = "sheets/ajobs";
const demoName = "Demo";
const demoURL = "demo";
const demoPath = "sheets/demo";

const sheetNames = [csProfessorName, academicJobName, demoName];
const sheetURLs = [csProfessorURL, academicJobURL, demoURL];
const sheetPaths = [csProfessorPath, academicJobPath, demoPath];

export const sheetNameToURL = new Map();
const sheetURLToName = new Map();
const sheetURLToSheetPath = new Map();

// TODO change to reflect other sheets
for (let i = 0; i < 1; i++) {
  const sheetName = sheetNames[i];
  const sheetURL = sheetURLs[i];
  const sheetPath = sheetPaths[i];
  sheetNameToURL.set(sheetName, sheetURL);
  sheetURLToName.set(sheetURL, sheetName);
  sheetURLToSheetPath.set(sheetURL, sheetPath);
}

export function hasRequestedSheet(urlName: string) {
  return sheetURLToName.has(urlName);
}

export function getRequestedSheetName(urlName: string) {
  return sheetURLToName.get(urlName);
}

export function getRequestedSheetPath(urlName: string) {
  return sheetURLToSheetPath.get(urlName);
}