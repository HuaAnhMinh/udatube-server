import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';

const logGroup = new AWS.CloudWatchLogs();

type LogDescription = {
  message: string;
  logStreamName: string;
};

export const writeLog = async (log: LogDescription) => {
  await logGroup.putLogEvents({
    logEvents: [{
      message: log.message,
      timestamp: Date.now()
    }],
    logGroupName: '/aws/lambda/udatube-dev',
    logStreamName: `${log.logStreamName}-${Date.now().toLocaleString()}-${uuid.v4()}`,
  }).promise();
};