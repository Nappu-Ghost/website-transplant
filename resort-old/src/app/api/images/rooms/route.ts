import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), 'public/content/rooms');
    const files = fs.readdirSync(imagesDir);
    
    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map(file => `/content/rooms/${file}`);
    
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error reading room images:', error);
    return NextResponse.json({ error: 'Failed to read room images' }, { status: 500 });
  }
} 