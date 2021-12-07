import * as errorsCtrl from './controllers/errors';
//import errorHandler from "errorhandler";
import app from './app';

/**
 * Error Handler. Provides full stack - remove for production
 */
const env = process.env.NODE_ENV || 'development';
if(env === 'development') {
  //app.use(errorHandler({ log: test }));  
  app.use(errorsCtrl.errors);
} else {
  //app.use(errorHandler()); 
  //app.use(errorsCtrl.error500);
  app.use(errorsCtrl.errors);
}

/**
 * Start Express server.
 */
const server = app.listen(app.get('port'), () => {
    console.log(
        '  App is running at http://localhost:%d in %s mode',
        app.get('port'),
        app.get('env')
    );
    console.log('  Press CTRL-C to stop\n');
});

export default server;
