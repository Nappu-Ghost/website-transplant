import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const iconsDir = path.join(process.cwd(), 'public', 'images', 'icons');
        const files = fs.readdirSync(iconsDir);
        
        // Filter only .svg files and return their paths
        const icons = files
            .filter(file => file.endsWith('.svg'))
            .map(file => ({
                path: `/images/icons/${file}`, // This path is relative to public directory
                name: file
            }));

        return NextResponse.json(icons);
    } catch (error) {
        console.error('Error reading icons directory:', error);
        return NextResponse.json(
            { error: 'Failed to fetch icons' },
            { status: 500 }
        );
    }
}