import { Request, Response } from "express";
import { getRequestedSheetName, hasRequestedSheet } from "../models/sheet";
import { makeRenderObject } from "../config/handlebars-helpers";


/**
 * GET /sheet/:sheet
 * Sheet page.
 */
export function getSheet(req: Request, res: Response) {
  const sheetURL = req.params.sheet;
  if (!hasRequestedSheet(sheetURL)) {
    req.flash("errors", { msg: "Cannot find requested sheet"});
    return res.redirect("/");
  }
  const sheetName = getRequestedSheetName(sheetURL);
  res.render("sheet", makeRenderObject({ title: `Sheet:${sheetName}`, sheetName: sheetName }, req));
}
