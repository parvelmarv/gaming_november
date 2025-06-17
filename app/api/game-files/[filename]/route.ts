import { NextRequest, NextResponse } from 'next/server';
import { downloadGameFile } from '@/lib/gameStorage';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    

    
    // Download the file from R2
    const fileData = await downloadGameFile('RolloRocket', filename);
    
    // Set appropriate headers based on file type
    const headers = new Headers();
    
    if (filename.endsWith('.js')) {
      headers.set('Content-Type', 'application/javascript');
    } else if (filename.endsWith('.wasm')) {
      headers.set('Content-Type', 'application/wasm');
    } else if (filename.includes('.data')) {
      headers.set('Content-Type', 'application/octet-stream');
    } else {
      headers.set('Content-Type', 'application/octet-stream');
    }
    
    // Enable CORS
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // Cache for 1 hour
    headers.set('Cache-Control', 'public, max-age=3600');
    
    return new NextResponse(fileData, {
      status: 200,
      headers
    });
    
  } catch (error) {
    console.error('Error serving game file:', error);
    return NextResponse.json(
      { error: 'Failed to load game file' },
      { status: 500 }
    );
  }
} 