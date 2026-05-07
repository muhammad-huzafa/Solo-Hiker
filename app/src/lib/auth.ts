// yeh file NextAuth ke liye configuration set karta hai like for login and signup
// session handling, and token management

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

// EXPLANATION:
// authOptions is the main configuration object for NextAuth
// It tells NextAuth:
// 1. How to verify users (providers)
// 2. What pages to use (login, error, etc.)
// 3. How to handle sessions
// 4. What to do after login/logout

export const authOptions: NextAuthOptions = {
  // PROVIDERS: These are the ways users can log in
  // We're using "credentials" (email + password)
  // You could also add Google, Facebook, etc.
  providers: [
    CredentialsProvider({
      // This is the "login with email/password" provider
      name: "credentials",
      
      // These are the input fields on the login form
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      // AUTHORIZE FUNCTION:
      // This runs when someone tries to login
      // It checks if the email/password are correct
      async authorize(credentials) {
        // Step 1: Check if email and password were provided
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        // Step 2: Find the user in the database by email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // Step 3: If user doesn't exist, reject login
        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Step 4: Check if the password is correct
        // bcrypt.compare() safely compares the entered password
        // with the hashed password stored in database
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        // Step 5: If password is wrong, reject login
        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Step 6: SUCCESS! Return user data
        // NextAuth will create a session with this data
       return {
              id: user.id,
              email: user.email,
              name: user.name ?? "",
             isAdmin: user.isAdmin, 
      };
      },
    }),
  ],


  pages: {
    signIn: "/login",      // Where to go for login
    error: "/login",       // Where to go if login fails
    // signOut: "/",       // Where to go after logout (optional)
  },

  // SESSION: How to store the "logged in" state
  session: {
    // Strategy  we use JSON Web Tokens
    // JWT is like a secure badge that proves you're logged in
    // It's stored in a cookie in the browser
    strategy: "jwt",
    
    // How long the session lasts (in seconds)
    // 30 days = 30 * 24 * 60 * 60 seconds
    maxAge: 30 * 24 * 60 * 60,
  },

  // JWT: Configure the tokens
  jwt: {
    // How long before the token expires
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // CALLBACKS: Functions that run at specific times
  // They let you customize what data is stored in the session/token
  callbacks: {
    // JWT CALLBACK:
    // Runs whenever a token is created or updated
    // This is where you add custom data to the token
    async jwt({ token, user }) {
      // When user first logs in, "user" object is available
      // We add the user ID to the token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.isAdmin = (user as any).isAdmin; 
      }
      
      // Return the token (with user ID added)
      return token;
    },

    // SESSION CALLBACK:
    // Runs whenever session data is requested
    // This is where you add token data to the session
    // The session is what you can access in your app
    async session({ session, token }) {
      // Add user ID from token to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
       (session.user as any).isAdmin = token.isAdmin; 
      }
      
      // Return the session (with user ID added)
      return session;
    },
  },

  // SECRET: next auth uses this to encrypt tokens and secure sessions
  secret: process.env.NEXTAUTH_SECRET,

  // DEBUG: Show detailed logs in development
  // Helps you see what's happening during login
  debug: process.env.NODE_ENV === "development",
};

/*
===========================================
HOW THIS WORKS - STEP BY STEP:
===========================================

1. USER TRIES TO LOGIN:
   - Goes to /login page
   - Enters email + password
   - Clicks "Sign In"

2. AUTHORIZE FUNCTION RUNS:
   - Checks if user exists in database
   - Compares password with hashed password
   - If correct → Returns user object
   - If wrong → Throws error

3. JWT CALLBACK RUNS:
   - Takes user object
   - Creates a JWT token
   - Adds user ID to token
   - Encrypts token with secret

4. TOKEN STORED:
   - NextAuth stores token in a cookie
   - Cookie name: "next-auth.session-token"
   - Cookie is httpOnly (JavaScript can't read it = more secure)

5. SESSION CALLBACK RUNS:
   - When you call getSession() or useSession()
   - Decrypts the token
   - Returns user data from token
   - You can now use session.user.id in your app

6. PROTECTED ROUTES:
   - You can check if session exists
   - If no session → Redirect to login
   - If session exists → Show page

7. USER LOGS OUT:
   - signOut() is called
   - Token is deleted
   - Session is destroyed
   - User redirected to login

===========================================
SECURITY FEATURES:
===========================================

 Passwords are hashed with bcrypt (not stored in plain text)
 Tokens are encrypted (can't be read or modified)
 Tokens expire after 30 days (must login again)
 HttpOnly cookies (JavaScript can't steal token)
 CSRF protection (prevents cross-site attacks)
 Secure cookies in production (only sent over HTTPS)
*/