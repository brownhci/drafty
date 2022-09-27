import { Request, Response } from 'express';

/**
 * POST /comments/:idrow
 * 
 * @param {string} req.query.idrow
 *
 */
 export const postLink = async (req: Request, res: Response) => {
    const results = {
        link: '',
        active: false
    };
    try {
        const idSession = req.session.user.idSession;
        const idProfile = req.session.user.idSession;
        const link = `https://brown.co1.qualtrics.com/jfe/form/SV_8JswNQ78QUfkDlA?trackId=pilot1${idSession}0${idProfile}`;
        results.link = link;
        results.active = true;
        return res.status(200).json(results);
    } catch (error) {
        return res.status(200).json(results);
    }
};
