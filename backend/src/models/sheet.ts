import { existsSync,readFileSync,PathLike } from 'fs';
import { safeLoad } from 'js-yaml';
import logger from '../util/logger'; 

const yamlPath = 'sheets.yaml';
const dirSheets = 'sheets/';
const dirEditHistory = 'edit_history/';
const sheetsUrl = '';

export const sheetsData = new Map();
export const sheetNameToURL = new Map();
const sheetURLToName = new Map();

async function getSheetsYAML() {
    if (existsSync(yamlPath)) {
        //logger.info("Using sheets.yaml file to supply sheet configuration data");
        const yamlData = readFileSync(yamlPath, 'utf8');
        return safeLoad(yamlData);
    } else {
        throw new Error('yaml File does not exist at: ' + yamlPath);
    }
}

async function createDataStructures() { 
    try {
        const yamlData: any = await getSheetsYAML();
        for (const key of Object.keys(yamlData)) {
            const sheetURL = sheetsUrl + key;
            const sheetName = yamlData[key].name;

            if(yamlData[key].in_menu) {
                sheetNameToURL.set(sheetName, sheetURL);
            }
            sheetURLToName.set(key, sheetName);
            sheetsData.set(key,yamlData[key]);
        }
        //console.log(sheetsData);
    } catch(err) {
        logger.error('ERROR - createDataStructures(): ' + err);
    } 
}
createDataStructures();

export async function getRequestedSheetName(urlName: string) {
    try {
        const yamlData: any = await getSheetsYAML();
        if(urlName in yamlData) {
            return [yamlData[urlName].name, yamlData[urlName].title];
        } else {
            throw new Error('yaml data does not contain urlName: ' + urlName);
        }
    } catch (err) {
        logger.error('ERROR - getRequestedSheetName():',err);
    }
}

export async function getRequestedSheetPath(urlName: string) {
    try {
        const path: PathLike = dirSheets + urlName;
        return path;
        /* sw - this is performance hit on page loads
        const file_path: PathLike = 'views/partials/' + path + fileExt;
        if (existsSync(file_path)) {
            return path;
        }
        */
    } catch(err) {
        logger.error('ERROR - path does not exists',err);
    }    
}

export async function getRequestedEditHistorySheetPath(urlName: string) {
    try {
        const path: PathLike = dirEditHistory + urlName;
        return path;
    } catch(err) {
        logger.error('ERROR - path does not exists',err);
    }    
}

export function hasRequestedSheet(urlName: string) {
    return sheetURLToName.has(urlName);
}
