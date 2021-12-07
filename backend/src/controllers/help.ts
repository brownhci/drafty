import { Request, Response } from 'express';
import { makeRenderObject } from '../config/handlebars-helpers';

/**
 * GET /help
 * Help page.
 */
export const getHelp = (req: Request, res: Response) => {
    res.render('pages/help', makeRenderObject({ title: 'Help' }, req));
};
