import { 
  GetObjectCommand, 
  ListObjectsV2Command 
} from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME } from './r2Config';

export const downloadGameFile = async (gameName: string, fileName: string): Promise<ArrayBuffer> => {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: `Build/${fileName}`,
  });

  const response = await r2Client.send(command);
  if (!response.Body) throw new Error('No file content found');
  
  // Convert the response body to ArrayBuffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }
  const concatenated = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    concatenated.set(chunk, offset);
    offset += chunk.length;
  }
  
  return concatenated.buffer;
};

export const listGameFiles = async (gameName: string): Promise<string[]> => {
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    Prefix: `games/${gameName}/`,
  });

  const response = await r2Client.send(command);
  return response.Contents?.map(item => item.Key?.split('/').pop() || '') || [];
}; 