import {SNSHandler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {resizeAvatar} from "../../businessLayer/user";

const ResizeAvatar: SNSHandler = async (event: any) => {
  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message;
    console.log('Processing S3 event', s3EventStr);
    const s3Event = JSON.parse(s3EventStr);
    for (const s3Record of s3Event.Records) {
      const key = s3Record.s3.object.key;
      console.log('Processing avatar with key', key);
      try {
        await resizeAvatar(key);
      }
      catch (e) {
        console.log('Key failed: ', key);
        console.log('Failed to resize avatar', e);
      }
    }
  }
};

export const main = middyfy(ResizeAvatar);