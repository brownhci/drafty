const csProfessorSheetName = "CS Professors";
const csProfessorSheetURLName = "professors";
const academicJobSheetName = "Academic Jobs";
const academicJobSheetURLName = "ajobs";

const sheetNames = [csProfessorSheetName, academicJobSheetName];
const sheetURLNames = [csProfessorSheetURLName, academicJobSheetURLName];

const sheetNameToSheetURLName = new Map();
const sheetURLNameToSheetName = new Map();

for (let i = 0; i < sheetNames.length; i++) {
  const sheetName = sheetNames[i];
  const sheetURLName = sheetURLNames[i];
  sheetNameToSheetURLName.set(sheetName, sheetURLName);
  sheetURLNameToSheetName.set(sheetURLName, sheetName);
}

export function hasRequestedSheet(urlName: string) {
  return sheetURLNameToSheetName.has(urlName);
}

export function getRequestedSheetName(urlName: string) {
  return sheetURLNameToSheetName.get(urlName);
}
