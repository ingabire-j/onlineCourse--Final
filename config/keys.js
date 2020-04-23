// this is the database key for the mongodb atlas
dbPassword = 'mongodb+srv://user:user123@polyglotians-pruts.mongodb.net/test?retryWrites=true&w=majority';

// by exporting this the module will export the database key as it is needed
module.exports = {
    mongoURI: dbPassword
};
