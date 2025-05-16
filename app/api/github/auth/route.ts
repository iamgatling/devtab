import { NextResponse } from "next/server"

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/github/callback`

export async function GET() {
  if (!GITHUB_CLIENT_ID) {
    return NextResponse.json({ error: "GitHub client ID not configured" }, { status: 500 })
  }

  // Generate a random state value for security
  const state = Math.random().toString(36).substring(2, 15)

  // Store state in a cookie for verification in the callback
  const response = NextResponse.redirect(
    `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo&state=${state}`,
  )

  response.cookies.set("github_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 5, // 5 minutes
  })

  return response
}
