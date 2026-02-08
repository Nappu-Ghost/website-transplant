import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET /api/images/hotels
export async function GET() {
  try {
    const hotelsDir = path.join(process.cwd(), 'public', 'content', 'hotels');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(hotelsDir)) {
      fs.mkdirSync(hotelsDir, { recursive: true });
    }

    const files = fs.readdirSync(hotelsDir);
    const images = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    const imageUrls = images.map(image => `/content/hotels/${image}`);
    return NextResponse.json(imageUrls);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch hotel images' }, { status: 500 });
  }
} 