import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that should have mobile versions
const MOBILE_PATHS = ['/warmup'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip if already on mobile path
  if (path.includes('/mobile')) {
    return NextResponse.next();
  }

  // Check if path should have mobile version
  const shouldHaveMobileVersion = MOBILE_PATHS.some(mobilePath => 
    path.startsWith(mobilePath)
  );

  if (shouldHaveMobileVersion) {
    const userAgent = request.headers.get('user-agent') || '';
    const viewport = request.headers.get('viewport-width');
    
    // More comprehensive mobile detection
    const isMobile = 
      /iPhone|iPad|iPod|Android/i.test(userAgent) || 
      (viewport && parseInt(viewport) < 768);

    if (isMobile) {
      // Update the path to use the correct mobile route structure
      const mobilePath = path.replace('/warmup', '/warmup/mobile');
      const mobileUrl = new URL(mobilePath, request.url);
      return NextResponse.redirect(mobileUrl);
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/warmup/:path*',
  ],
}; 