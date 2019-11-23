const csProfessorSheetName = "CS Professors";
const csProfessorSheetURLName = "professors";
const csProfessorTemplatePath = "sheets/professors";
const academicJobSheetName = "Academic Jobs";
const academicJobSheetURLName = "ajobs";
const academicJobTemplatePath = "sheets/ajobs";

const sheetNames = [csProfessorSheetName, academicJobSheetName];
const sheetURLNames = [csProfessorSheetURLName, academicJobSheetURLName];
const sheetTemplatePaths = [csProfessorTemplatePath, academicJobTemplatePath];

export const sheetNameToSheetURLName = new Map();
const sheetURLNameToSheetName = new Map();
const sheetURLNameToSheetTemplatePath = new Map();

for (let i = 0; i < sheetNames.length; i++) {
  const sheetName = sheetNames[i];
  const sheetURLName = sheetURLNames[i];
  const sheetTemplatePath = sheetTemplatePaths[i];
  sheetNameToSheetURLName.set(sheetName, sheetURLName);
  sheetURLNameToSheetName.set(sheetURLName, sheetName);
  sheetURLNameToSheetTemplatePath.set(sheetURLName, sheetTemplatePath);
}

export function hasRequestedSheet(urlName: string) {
  return sheetURLNameToSheetName.has(urlName);
}

export function getRequestedSheetName(urlName: string) {
  return sheetURLNameToSheetName.get(urlName);
}

export function getRequestedSheetTemplatePath(urlName: string) {
  return sheetURLNameToSheetTemplatePath.get(urlName);
}
