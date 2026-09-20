import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/problem-statements(.*)',
  '/api(.*)',
  '/preview-phase2-email(.*)',
  '/teams-breakdown(.*)',
  '/sitemap.xml',
  '/robots.txt'
]);

export default function middleware(req: any, ev: any) {
  // If Clerk environment variables are not set (e.g. standalone Vercel deploy of results portal)
  if (!process.env.CLERK_SECRET_KEY && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next();
  }
  return clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  })(req, ev);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
