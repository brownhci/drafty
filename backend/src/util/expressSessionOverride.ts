// eslint-disable-next-line @typescript-eslint/no-unused-vars
import session from 'express-session';

declare module 'express-session' {
  export interface SessionData {
    user: { [key: string]: any };
    isAuth: boolean;
    returnTo: string;
  }
}