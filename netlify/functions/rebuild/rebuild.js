const { schedule } = require('@netlify/functions');
const fetch = require('node-fetch');

const REBUILD_URL = process.env.rebuildurl;

const handler = async function(event, context) {

    await fetch(REBUILD_URL, { method: 'POST'});

    return {
        statusCode: 200,
    };
};

module.exports.handler = schedule("@daily", handler);
