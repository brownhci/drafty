import logger from "../util/logger";

process.on("unhandledRejection", function(err) {
    logger.error("ERROR - unhandledPromiseRejection");
    logger.error(err);
});

export default process;
