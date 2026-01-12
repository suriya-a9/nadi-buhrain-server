const mongoose = require('mongoose');
const config = require('./default');
const logger = require('../logger');

const connectDb = async () => {
    await mongoose.connect(config.url)
        .then(() => {
            logger.info('connected')
        })
        .catch((err) => {
            logger.info(err)
        })
}

module.exports = connectDb;