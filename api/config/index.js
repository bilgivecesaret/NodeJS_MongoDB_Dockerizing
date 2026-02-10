module.exports={
    PORT: process.env.PORT || "3000",
    LOG_LEVEL: process.env.LOG_LEVEL || "debug",
    CONNECTION_STRING: process.env.CONNECTION_STRING || "mongodb://localhost:27017/nodejs_mongodb",
    JWT: {
        "SECRET": "123456789",
        "EXPIRATION_TIME": !isNaN(parseInt(process.env.JWT_EXPIRATION_TIME)) ? parseInt(process.env.JWT_EXPIRATION_TIME) : 3600*24
    },
    DEFAULT_LANG: process.env.DEFAULT_LANG || "EN"
}