import { Request, Response } from 'express';
import { TWITTER_API_KEY, TWITTER_API_SECRET_KEY, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET } from '../util/secrets';
import Twitter from 'twitter'; 
import { Url } from 'url';

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
    return res.sendStatus(200);
};
