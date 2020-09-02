import { Request, Response } from "express";
import { makeRenderObject } from "../config/handlebars-helpers";
import { sheetsData }  from "../models/sheet";


function getSheets() {
  let sheets = new Array();
  console.log(' -- ',Object.keys(sheetsData));

  sheetsData.forEach((data, sheetUrl) => {
    if(data.on_homepage) {
      const link = '/' + sheetUrl
      sheets.push({
        link: link,
        name: data.name
      });
    }
  })
  return sheets
}

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  console.log('getSheets() = ',getSheets());
  res.render("pages/home", makeRenderObject({
    ignoreHeader: true,
    ignoreFooter: true,
    title: "Home",
    sheets: getSheets(),
    publications: [
      {
        link: "https://jeffhuang.com/Final_Drafty_HCOMP17.pdf",
        name: "Drafty: Enlisting Users to be Editors who Maintain Structured Data",
        description: "Shaun Wallace, Lucy van Kleunen, Marianne Aubin-Le Quere, Abraham Peterkin, Yirui Huang, Jeff Huang. HCOMP 2017"
      },
    ]
  }, req));
};
