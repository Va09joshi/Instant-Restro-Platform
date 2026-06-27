import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Since we rely on client-side Firebase Auth, 
  // middleware just handles basic structural checks or edge-cases.
  // Real role-based protection will primarily happen in layout components.

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/restaurant/:path*'],
};
