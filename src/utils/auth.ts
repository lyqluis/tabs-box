export type AuthToken = {
  grantedScopes?: string[]
  token?: string
}
export const validateToken = async (authToken: AuthToken) => {
  try {
    const response = await fetch(
      "https://www.googleapis.com/drive/v3/about?fields=user",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken.token}`
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      console.log("Token is valid:", data)
      return true
    } else {
      const errorData = await response.json()
      console.error("Token is invalid:", errorData)
      return false
    }
  } catch (error) {
    console.error("Error validating token:", error)
    return false
  }
}
