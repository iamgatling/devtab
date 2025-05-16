import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export async function GET(request: NextRequest) {
  // Get the code and state from the query parameters
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  // Get the stored state from the cookie
  const cookieStore = cookies()
  const storedState = cookieStore.get("github_oauth_state")?.value

  // Verify state to prevent CSRF attacks
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${APP_URL}/github-error?error=invalid_state`)
  }

  if (!code) {
    return NextResponse.redirect(`${APP_URL}/github-error?error=no_code`)
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error("GitHub OAuth error:", tokenData.error)
      return NextResponse.redirect(`${APP_URL}/github-error?error=${tokenData.error}`)
    }

    // Create a response that redirects to the GitHub success page
    const response = NextResponse.redirect(`${APP_URL}/github-success?token=${tokenData.access_token}`)

    // Clear the state cookie
    response.cookies.set("github_oauth_state", "", {
      httpOnly: true,
      expires: new Date(0),
    })

    return response
  } catch (error) {
    console.error("Error exchanging GitHub code for token:", error)
    return NextResponse.redirect(`${APP_URL}/github-error?error=server_error`)
  }
}
