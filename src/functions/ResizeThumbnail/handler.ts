import {SNSHandler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {resizeThumbnail} from "../../businessLayer/video";

const ResizeThumbnail: SNSHandler = async (event: any) => {
  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message;
    console.log('Processing S3 event', s3EventStr);
    const s3Event = JSON.parse(s3EventStr);
    for (const s3Record of s3Event.Records) {
      const key = s3Record.s3.object.key;
      console.log('Processing thumbnail with key', key);
      try {
        await resizeThumbnail(key);
      }
      catch (e) {
        console.log('Key failed: ', key);
        console.log('Failed to resize thumbnail', e);
      }
    }
  }
};

export const main = middyfy(ResizeThumbnail);