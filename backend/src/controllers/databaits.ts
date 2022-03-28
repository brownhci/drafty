import { Request, Response, NextFunction } from 'express';
import { TWITTER_API_KEY, TWITTER_API_SECRET_KEY, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET } from '../util/secrets';
import Twitter from 'twitter'; 
import { insertDataBaitVisit, updateDatabaitClosed }  from '../database/databaits';

const client = new Twitter({
    consumer_key: TWITTER_API_KEY,
    consumer_secret: TWITTER_API_SECRET_KEY,
    access_token_key: TWITTER_ACCESS_TOKEN,
    access_token_secret: TWITTER_ACCESS_TOKEN_SECRET
});

function getTweetURL(tweet: Twitter.ResponseData): string {
    return `https://twitter.com/did_you_know_cs/status/${tweet.id_str}`;
}

/**
 * POST /databait/tweet
 *
 * @param {string} req.body.dataBait
 * @param {string} req.body.dataBaitType
 * @param {Array<string>} req.body.labels
 * 
 */
export const postTweet = (req: Request, res: Response) => {
    client.post('statuses/update', {status: 'testing...'})
        .then(function (tweet) {
            console.log(tweet);
            console.log(tweet.id_str);
            const tweetURL = getTweetURL(tweet);
            return res.sendStatus(200);
        })
        .catch(function (error) {
            console.log(error);
            return res.sendStatus(500);
        });
};

/**
 * POST /databait/tweet/next
 *
 * @param {string} req.body.idDataBait
 * 
 */
 export const postTweetNextAction = (req: Request, res: Response) => {
    res.status(200);
};

/**
 * POST /databait/create
 *
 * @param {string} req.body.dataBait
 * @param {string} req.body.dataBaitType
 * @param {Array<string>} req.body.labels
 * @param {string} req.body.createdType
 * 
 */
export const postDataBaitCreated = (req: Request, res: Response) => {
    // right-click, edit, new-row, delete-row, navbar-menu, modal-like, modal-random
    const dataBait = req.body.dataBait;
    const dataBaitType = req.body.dataBaitType;
    const labels = req.body.labels;
    const createdType = req.body.createdType;
    return res.sendStatus(200);
};

/**
 * POST /databait/next
 *
 * @param {string} req.body.idDataBait
 * 
 */
 export const postDataBaitNextAction = (req: Request, res: Response) => {
    res.status(200);
};


/**
 * POST /databait/close
 *
 * record time when user closes window, or generate another databait
 * 
 * @param {string} req.body.idDataBait
 * @param {number} req.body.windowClose
 * 
 */
 export const postDataBaitWindowClosed = (req: Request, res: Response) => {
    // right-click, edit, new-row, delete-row, navbar-menu, modal-like, modal-random
    const idDataBait = req.body.idDataBait;
    updateDatabaitClosed(idDataBait);
    return res.sendStatus(200);
};

//middleware
export function checkDataBaitsVisit(req: Request, res: Response, next: NextFunction) {
    if(req.query.d) {
        const idSession = req.session.user.idSession;
        const idDataBait = req.query.d as string;
        let source: string = '';
        if(req.query.src) {
            source = req.query.src  as string;
        }
        insertDataBaitVisit(idSession, idDataBait, source);
    }
    next();
  }

/**
 * POST /databait/visit
 * 
 * @param {number} req.body.idDataBait
 *
 * @param {string} req.body.source
 */
 export const postDataBaitVisit = (req: Request, res: Response) => {
    const idSession = req.session.user.idSession;
    const idDataBait: string = req.body.idDataBait;
    const source: string = req.body.source; // is this reliable?
  
    try {
      //console.log('postDataBaitVisit:', idDataBait, source);
      insertDataBaitVisit(idSession, idDataBait, source);
      return res.sendStatus(200);
    } catch (error) {
      return res.sendStatus(500);
    }
  };