// src\app\api\vision\route.ts
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { NextResponse } from 'next/server';

// Initialize the client with your credentials
const client = new ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_PROJECT_ID,
});

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    
    // Perform the image analysis
    const [result] = await client.labelDetection({
      image: {
        content: image.split(',')[1]  // Remove the data:image/jpeg;base64, part
      }
    });

    return NextResponse.json({ 
      success: true, 
      labels: result.labelAnnotations 
    });
    
  } catch (error: unknown) {
    console.error('Vision API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}