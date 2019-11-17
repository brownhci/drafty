import { Request, Response } from "express";
import { makeRenderObject } from "../config/handlebars-helpers";

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
    res.render("pages/home", makeRenderObject({
      ignoreHeader: true,
      ignoreFooter: true,
      title: "Home",
      sheets: [
        {
          link: "/professors",
          name: "Computer Science Professors",
          relatedContent: `<p>See an <a href="https://jeffhuang.com/computer_science_professors.html">analysis of computer science hiring trends</a></p>`
        },
        {
          link: "/ajobs",
          name: "Academic Jobs"
        }
      ],
      publications: [
        {
          link: "https://jeffhuang.com/Final_Drafty_HCOMP17.pdf",
          name: "Drafty: Enlisting Users to be Editors who Maintain Structured Data",
          description: "Shaun Wallace, Lucy van Kleunen, Marianne Aubin-Le Quere, Abraham Peterkin, Yirui Huang, Jeff Huang. HCOMP 2017"
        },
      ]
    }, req));
};
