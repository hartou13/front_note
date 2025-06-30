import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
  try {
    const routesPath = path.join(process.cwd(), 'src', 'lib', 'navigation', 'routes.json');
    
    if (fs.existsSync(routesPath)) {
      const routesData = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));
      return NextResponse.json(routesData);
    } else {
      return NextResponse.json(
        { error: 'Routes file not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error loading routes:', error);
    return NextResponse.json(
      { error: 'Failed to load routes' },
      { status: 500 }
    );
  }
} 