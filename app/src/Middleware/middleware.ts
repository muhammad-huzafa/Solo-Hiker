// This file runs BEFORE every request
// It checks if the user is logged in and protects certain routes

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// moiddle ware is like a gatekeeper that runs before your pages load
//yeh dekhy ga k user logged in ha ya nahi, aur uske hisab se access dega ya redirect karega
// protected routes: dashboard, profile, settings (only for logged in users)

export default withAuth(
  // This function runs for protected routes
  function middleware(req) {
    // req.nextauth.token contains the user's session token
    // If token exists = user is logged in
    // If token is null = user is NOT logged in
    
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    console.log(" Middleware check:", {
      path: path,
      isLoggedIn: !!token,
      userEmail: token?.email || "Not logged in",
    });

    // If user is logged in and tries to access login/register pages
    // Redirect them to dashboard instead
    if (token && (path === "/login" || path === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // ADMIN ROUTE PROTECTION
    // Agar koi /admin ya uske andar kisi bhi page par jaane ki koshish kare
   if (path.startsWith("/admin")) {
  
    // Logged in nahi hai bilkul → login page par bhejo
   if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
     }

    // Logged in hai lekin admin nahi → unke apne dashboard par bhejo
   if (!token.isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
}
    // Allow the request to continue
    return NextResponse.next();
  },
  {
    // CALLBACKS:
    // These run to determine if a user can access a route
    callbacks: {
      // authorized() decides if the request should be allowed
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // PUBLIC ROUTES (anyone can access):
        // - Landing page (/)
        // - Login page (/login)
        // - Register page (/register)
        if (path === "/" || path === "/login" || path === "/register") {
          return true; // ✅ Allow access
        }

        // PROTECTED ROUTES (must be logged in):
        // - Dashboard (/dashboard)
        // - Profile (/profile)
        // - Any other routes
        // Check if user has a token (is logged in)
        return !!token; // ✅ Allow if token exists, ❌ Deny if no token
      },
    },
    
    // PAGES:
    // Where to redirect if not authorized
    pages: {
      signIn: "/login", // Redirect to login page if not logged in
    },
  }
);

// CONFIG:
// Define which routes this middleware should run on
export const config = {
  // Matcher: Routes where middleware runs
  // This runs on ALL routes except:
  // - Static files (images, fonts, etc.)
  // - API routes starting with /api/
  // - Next.js internal files (_next)
  matcher: [
    // Match all routes except the excluded ones below
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
/*

HOW THIS WORKS
EXAMPLE 1: User tries to access /dashboard without logging in
1. Middleware runs
2. Checks if token exists → NO
3. authorized() returns false
4. User redirected to /login
5. Dashboard page never loads

EXAMPLE 2: User is logged in and tries to access /dashboard
1. Middleware runs
2. Checks if token exists → YES
3. authorized() returns true
4. Request continues
5. Dashboard page loads

EXAMPLE 3: User is logged in and tries to access /login
1. Middleware runs
2. Token exists → User is logged in
3. middleware() function runs
4. Detects user is on /login
5. Redirects to /dashboard instead

EXAMPLE 4: Guest tries to access landing page /
1. Middleware runs
2. Path is "/" → public route
3. authorized() returns true (public access)
4. Page loads normally
*/