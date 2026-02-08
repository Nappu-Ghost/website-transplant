import { readdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const imagesPath = path.join(process.cwd(), 'public', 'images', 'clinics');
    const files = await readdir(imagesPath);

    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map(file => ({
        name: file.replace(/\.[^/.]+$/, ''), // Remove extension
        path: `/images/clinics/${file}`
      }));

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error reading clinic images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinic images' },
      { status: 500 }
    );
  }
}