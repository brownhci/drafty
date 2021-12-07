import { Request, Response } from 'express';
import { makeRenderObject } from '../config/handlebars-helpers';
// import { sheetsData }  from "../models/sheet";

// sw - unused for now
/*
function getSheets() {
  const sheets: Array<Record<string, any>> = [];
  sheetsData.forEach((data, sheetUrl) => {
    if(data.on_homepage) {
      const link = "/" + sheetUrl;
      sheets.push({
        link: link,
        name: data.name
      });
    }
  });
  return sheets;
}
*/

export const flaskTest = (req: Request, res: Response) => {
  res.redirect('http://localhost:5000');
};

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  res.render('pages/home', makeRenderObject({
    errors: false,
    ignoreHeader: true,
    ignoreFooter: true,
    title: 'Home',
    publications: [
      {
        link: 'https://jeffhuang.com/Final_Drafty_HCOMP17.pdf',
        name: 'Drafty: Enlisting Users to be Editors who Maintain Structured Data',
        description: 'Shaun Wallace, Lucy van Kleunen, Marianne Aubin-Le Quere, Abraham Peterkin, Yirui Huang, Jeff Huang. HCOMP 2017',
        source: true
      },
      {
        link: 'https://jeffhuang.com/papers/TabularDatasets_CSCW21.pdf',
        name: 'Case Studies on the Motivation and Performance of Contributors Who Verify and Maintain In-Flux Tabular Datasets',
        description: 'Shaun Wallace, Alexandra Papoutsaki, Neilly H. Tan, Hua Guo, Jeff Huang. CSCW 2021'
      },
    ]
  }, req));
};
