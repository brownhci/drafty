import { Request, Response } from "express";
import { getRequestedSheetName, getRequestedSheetPath, hasRequestedSheet } from "../models/sheet";
import { makeRenderObject } from "../config/handlebars-helpers";
// import { genSheets } from "../database/gen_spreadsheets";

/**
 * GET /sheet/:sheet
 * Sheet page.
 */
export function getSheet(req: Request, res: Response) {
  const sheetURL = req.params.sheet;
  if (!hasRequestedSheet(sheetURL)) {
    if(sheetURL !== "service-worker.js") { // sw bug: service-worker.js is getting this endpoint
      req.flash("errors", { msg: "Oh sorry we cannot find requested sheet :("});
    }
    return res.redirect("/");
  } else if(!req.user) {
    res.render("account/signup", makeRenderObject({ title: "Signup" }, req));
  } else {
    const sheetName = getRequestedSheetName(sheetURL);
    const sheetPath = getRequestedSheetPath(sheetURL);
    res.render("pages/sheet", makeRenderObject({ title: `Sheet:${sheetName}`, sheetName: sheetName, sheetPath: sheetPath }, req));
  }
}
