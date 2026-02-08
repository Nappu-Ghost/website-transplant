import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const activitiesDir = path.join(process.cwd(), 'public/content/activities');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(activitiesDir)) {
      fs.mkdirSync(activitiesDir, { recursive: true });
    }

    const files = fs.readdirSync(activitiesDir);
    const images = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.svg'].includes(ext);
    });

    const imageUrls = images.map(image => `/content/activities/${image}`);
    return NextResponse.json(imageUrls);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activity images' }, { status: 500 });
  }
}