import { Request, Response } from "express";
import { getRequestedSheetName, hasRequestedSheet } from "../models/sheet";
import { makeRenderObject } from "../config/handlebars-helpers";
import { genSheets } from "../database/gen_spreadsheets";

/**
 * GET /sheet/:sheet
 * Sheet page.
 */
export function getSheet(req: Request, res: Response) {
  const sheetURL = req.params.sheet;
  if (!hasRequestedSheet(sheetURL)) {
    req.flash("errors", { msg: "Oh sorry we cannot find requested sheet :("});
    return res.redirect("/");
  }
  const sheetName = getRequestedSheetName(sheetURL);
  res.render("sheet", makeRenderObject({ title: `Sheet:${sheetName}`, sheetName: sheetName }, req));
}

/**
 * POST /sheet/:sheet
 * Sheet page.
 */
export function genSheet(req: Request, res: Response) {
  genSheets(req.session.user.idProfile);
  res.status(200).end();
}
