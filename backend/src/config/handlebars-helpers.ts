import { sheetNameToURL } from "../models/sheet";

interface RequestWithUser {
    user?: any;
}

const helpers = {
  ifEquals: function(arg1: string, arg2: string) {
    if(arg1 == arg2) {
      return true;
    } else {
      return false;
    }
  },
  selected: function(target: string, toMatch: string) {
    return target === toMatch ? " selected" : "";
  },
  reserveNavbarPaddingClass: function(ignoreHeader: undefined | boolean) {
    if (ignoreHeader === undefined || ignoreHeader) {
      return " reserve-navbar-padding";
    }
    return "";
  },
  getUserSignedInClass: function(isSignedIn: boolean) {
    return isSignedIn ? " active-user" : " anonymous-user";
  },
  getValidationClass: function(validationErrors: undefined | Array<string>) {
    if (Array.isArray(validationErrors) && validationErrors.length) {
      return " is-invalid";
    }
    return "";
  },
  eachInMap: function(map: Map<string, string>, block: any) {
    let output = "";

    if (map) {
      for (const [ key, value ] of map) {
        output += block.fn({ key, value });
      }
    }

    return output;
  },
  menuHasMultipleSheets: function(map: Map<string, string>) {
    if (map.size > 1) {
      return true;
    } else {
      return false;
    }
  },
  times: function(n: number, block: any) {
    let accum = "";
    for(let i = 0; i < n; ++i)
        accum += block.fn(i);
    return accum;
  },
};

export function makeRenderObject(renderObject: any, req: RequestWithUser) {
  renderObject["signedIn"] = !!req.user;
  renderObject["sheetNameToURL"] = sheetNameToURL;
  return renderObject;
}

export default helpers;
