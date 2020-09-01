import { existsSync,readFileSync,PathLike } from "fs";
import { safeLoad } from "js-yaml";
import logger from "../util/logger"; 

const yamlPath = "sheets.yaml";
const dir = "sheets/";
const sheetsUrl = "sheets/";

export const sheetNameToURL = new Map();
const sheetURLToName = new Map();

async function getSheetsYAML() {
    if (existsSync(yamlPath)) {
        //logger.info("Using sheets.yaml file to supply sheet configuration data");
        const yamlData = readFileSync(yamlPath, "utf8");
        return safeLoad(yamlData);
    } else {
        throw new Error("yaml File does not exist at: " + yamlPath);
    }
}

async function createDataStructures() { 
    try {
        const yamlData: any = await getSheetsYAML();
        for (const key of Object.keys(yamlData)) {
            const sheetURL = sheetsUrl + key;
            const sheetName = yamlData[key].name;
            sheetNameToURL.set(sheetName, sheetURL);
            sheetURLToName.set(key, sheetName);
        }
    } catch(err) {
        logger.error("ERROR - createDataStructures(): " + err);
    } 
}
createDataStructures();

export async function getRequestedSheetName(urlName: string) {
    try {
        const yamlData: any = await getSheetsYAML();
        if(urlName in yamlData) {
            return yamlData[urlName].name;
        } else {
            throw new Error("yaml data does not contain urlName: " + urlName);
        }
    } catch (err) {
        logger.error("ERROR - getRequestedSheetName():",err);
    }
}

export async function getRequestedSheetPath(urlName: string) {
    try {
        const path: PathLike = dir + urlName;
        return path;
        /* sw - this is performance hit on page loads
        const file_path: PathLike = 'views/partials/' + path + fileExt;
        if (existsSync(file_path)) {
            return path;
        }
        */
    } catch(err) {
        logger.error("ERROR - path does not exists",err);
    }    
}

export function hasRequestedSheet(urlName: string) {
    return sheetURLToName.has(urlName);
}
