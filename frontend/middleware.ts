import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/health",
]);

export default clerkMiddleware(async (auth, request) => {
  // Bypass auth ONLY in development/test environments
  // NEVER bypass in production for security
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const bypassAuth = process.env.BYPASS_AUTH === 'true';

  if (bypassAuth && !isDevelopment) {
    // Security: log and ignore bypass attempt in production
    console.error('⚠️  SECURITY: Attempted to bypass auth in production. This is blocked.');
  }

  // Only allow bypass in non-production environments
  if (bypassAuth && isDevelopment) {
    return;
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
