import { 
  GetObjectCommand, 
  ListObjectsV2Command 
} from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME } from './r2Config';

export async function downloadGameFile(gameName: string, fileName: string): Promise<ArrayBuffer> {
  try {
    // Files are directly in the Build directory
    const key = `Build/${fileName}`;
    


    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    const response = await r2Client.send(command);
    
    if (!response.Body) {
      throw new Error('No response body received from R2');
    }

    // Convert the response body to an ArrayBuffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }

    // Combine all chunks into a single Uint8Array
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result.buffer;
  } catch (error) {
    console.error('Error downloading game file:', error);
    throw error;
  }
}

export async function listGameFiles(): Promise<string[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: 'Build/',
    });

    const response = await r2Client.send(command);
    return (response.Contents || []).map(item => item.Key || '');
  } catch (error) {
    console.error('Error listing game files:', error);
    throw error;
  }
} 