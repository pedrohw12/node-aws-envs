'use strict';
const uuid = require('uuid');
const axios = require('axios');
const cheerio = require('cheerio');
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient()

const settings = require('./config/settings');

class Handler {
  static async main(event) {

    console.log('at', new Date().toISOString(), JSON.stringify(event, null, 2))

    const { data } = await axios.get(settings.commitMessageUrl)
    const $ = cheerio.load(data)
    const [commitMessage] = $("#content").text().trim().split('\n')

    console.log('Message', commitMessage)

    const params = {
      TableName: settings.dbTableName,
      Item: {
        commitMessage,
        id: uuid.v1(),
        createdAt: new Date().toISOString()
      }
    }

    await dynamoDB.put().promise()

    console.log('Process finished at', new Date().toISOString())
 
    return {
      statusCode: 200
    }
  }
}

module.exports = {
  scheduler: Handler.main
}
