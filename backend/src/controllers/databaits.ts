import { Request, Response, NextFunction } from 'express';
import { TWITTER_API_KEY, TWITTER_API_SECRET_KEY, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET } from '../util/secrets';
import Twitter from 'twitter'; 
import { insertDatabaitVisit, insertVisitFromSrc, updateDatabaitNextAction, insertDatabaitTweet, updateDatabaitTweetNextAction }  from '../database/databaits';

const client = new Twitter({
    consumer_key: TWITTER_API_KEY,
    consumer_secret: TWITTER_API_SECRET_KEY,
    access_token_key: TWITTER_ACCESS_TOKEN,
    access_token_secret: TWITTER_ACCESS_TOKEN_SECRET
});

function getTweetURL(tweet: Twitter.ResponseData): string {
    return `https://twitter.com/did_you_know_cs/status/${tweet.id_str}`;
}

function cleanHashTag(value: string) {
    const universityNameShortener: Record<string, string> = {
        'Massachusetts Institute of Technology': 'MIT',
        'University of California, Berkeley': 'Berkeley',
        'University of Texas at Austin': 'UniversityofTexas',
        'Pennsylvania State University': 'PennState',
        'California Institute of Technology': 'CalTech',
        'Georgia Institute of Technology': 'GeorgiaTech',
        'New York University': 'NYU',
        'North Carolina State University': 'NCState'
    };    
    if (value in universityNameShortener) {
        value = universityNameShortener[value];
    }
    return value.replace('-','').replace(',','').replace('&','').replace(' at ','').replace(/\s+/g, '');
}

function isNumeric(n: string): boolean {
    return !isNaN(parseFloat(n)) && !isNaN(parseFloat(n) - 0);
  }

function getTweetHashes(labels: Array<string>, datasetname: string) {
    let tweet_hashes: string = '';
    labels.forEach(label => {
        if(!isNumeric(label)) {
            tweet_hashes += `#${cleanHashTag(label)} `;
        }
    });
    return  `${tweet_hashes}#${cleanHashTag(datasetname)}`;
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
    console.log('postTweet');
    const idSession = req.session.user.idSession;
    const idDatabait = req.body.idDatabait;
    const sentence = req.body.sentence;
    const datasetname = req.body.datasetname;
    const labels = req.body.labels;
    const databaitsMsq: string = `[source: drafty.cs.brown.edu/csprofessors?d=${idDatabait}&src=tw]`;
    const tweet_content: string = `${sentence}\n${getTweetHashes(labels, datasetname)}\n${databaitsMsq}`;
    console.log(tweet_content);
    // send tweet
    client.post('statuses/update', {status: tweet_content})
        .then(function (tweet) {
            const tweetURL = getTweetURL(tweet);
            insertDatabaitTweet(idSession, idDatabait, tweetURL);
            console.log(tweetURL);
            return res.status(200).json(tweetURL);
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
    const idDatabaitTweet = req.body.idDatabaitTweet;
    const nextAction = req.body.nextAction;
    updateDatabaitTweetNextAction(idDatabaitTweet, nextAction);
    res.status(200);
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