import { Request, Response, NextFunction } from 'express';
import { TWITTER_API_KEY, TWITTER_API_SECRET_KEY, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET } from '../util/secrets';
import Twitter from 'twitter'; 
import { insertDatabaitVisit, insertVisitFromSrc, updateDatabaitNextAction }  from '../database/databaits';

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
 * @param {string} req.body.idDatabait
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
export const postDatabaitCreated = (req: Request, res: Response) => {
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
 * @param {string} req.body.idDatabait
 * 
 */
 export const postDatabaitNextAction = (req: Request, res: Response) => {
    try {
        const idDatabait = req.body.idDatabait;
        const nextAction = req.body.nextAction;
        //console.log(`postDatabaitNextAction for databait ${idDatabait}, next action = ${nextAction}`);
        updateDatabaitNextAction(idDatabait, nextAction);
      return res.sendStatus(200);
    } catch (error) {
      return res.sendStatus(500);
    }
};

//middleware
export function checkVisitFromSrc(req: Request, res: Response, next: NextFunction) {
    if(req.query.d) { // idDatabait
        const idSession = req.session.user.idSession;
        const idDatabait = req.query.d as string;
        let source: string = '';
        if(req.query.src) {
            source = req.query.src  as string;
        }
        insertDatabaitVisit(idSession, idDatabait, source);
    } else if(req.query.src) {
        const idSession = req.session.user.idSession;
        let source: string = '';
        if(req.query.src) {
            source = req.query.src  as string;
        }
        let searchCol: string = '';
        if(req.query.src) {
            searchCol = req.query.searchcol  as string;
        }
        let searchVal: string = '';
        if(req.query.src) {
            searchVal = req.query.searchval  as string;
        }
        insertVisitFromSrc(idSession, source, searchCol, searchVal);
    }
    next();
  }

/**
 * POST /databait/visit
 * 
 * @param {number} req.body.idDatabait
 *
 * @param {string} req.body.source
 */
 export const postDatabaitVisit = (req: Request, res: Response) => {
    const idSession = req.session.user.idSession;
    const idDatabait: string = req.body.idDatabait;
    const source: string = req.body.source; // is this reliable?
  
    try {
      //console.log('postDatabaitVisit:', idDatabait, source);
      insertDatabaitVisit(idSession, idDatabait, source);
      return res.sendStatus(200);
    } catch (error) {
      return res.sendStatus(500);
    }
  };