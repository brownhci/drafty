import { Request, Response } from 'express';

/**
 * POST /comments/:idrow
 * 
 * @param {string} req.query.idrow
 *
 */
 export const postLink = async (req: Request, res: Response) => {
    console.log('postLink');
    const idSession = req.session.user.idSession;
    const link = `https://brown.co1.qualtrics.com/jfe/form/SV_8JswNQ78QUfkDlA?trackId=pilot1${idSession}0`;

    const results = {
        link: link,
        activate: 0
    };
    return res.status(200).json(results);
};
