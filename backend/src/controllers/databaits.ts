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

export const postTweet = (req: Request, res: Response) => {
    console.log('postTweet');
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
