import logger from "../util/logger";

process.on('unhandledRejection', function(err) {
    logger.error(err);
});

export default process;
