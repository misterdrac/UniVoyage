import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { apiService } from "@/services/api"
import { toast } from "sonner"
import { useAuth } from "@/contexts"


export default function GoogleCallbackPage() {
  const navigate = useNavigate()
  const { loadUser } = useAuth()
  const ran = useRef(false)
  const isPopup = window.opener !== null

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    const error = params.get("error")

    if (error) {
      const errorMsg = `Google auth error: ${error}`
      if (isPopup) {
        // Send error to parent window
        window.opener?.postMessage(
          { type: 'GOOGLE_OAUTH_ERROR', error: errorMsg },
          window.location.origin
        )
        window.close()
      } else {
        toast.error(errorMsg)
        navigate("/")
      }
      return
    }
    
    if (!code) {
      const errorMsg = "Missing Google authorization code"
      if (isPopup) {
        window.opener?.postMessage(
          { type: 'GOOGLE_OAUTH_ERROR', error: errorMsg },
          window.location.origin
        )
        window.close()
      } else {
        toast.error(errorMsg)
        navigate("/")
      }
      return
    }

    ;(async () => {
      try {
          const res = await apiService.googleCallback(code)

          if (!res.success) {
              const errorMsg = res.error || "Google login failed"
              if (isPopup) {
                window.opener?.postMessage(
                  { type: 'GOOGLE_OAUTH_ERROR', error: errorMsg },
                  window.location.origin
                )
                window.close()
              } else {
                toast.error(errorMsg)
                navigate("/")
              }
              return
          }

          await loadUser()

          // Get stored redirect URL or default to home
          const redirectUrl = sessionStorage.getItem('google_oauth_redirect')
          sessionStorage.removeItem('google_oauth_redirect')

          if (isPopup) {
            // Send success to parent window
            window.opener?.postMessage(
              { type: 'GOOGLE_OAUTH_SUCCESS' },
              window.location.origin
            )
            // Close popup immediately - parent will show success toast
            window.close()
          } else {
            toast.success("Signed in with Google!")
            navigate(redirectUrl || "/")
          }
      } catch (e: any) {
          const errorMsg = e?.message || "Google login failed"
          if (isPopup) {
            window.opener?.postMessage(
              { type: 'GOOGLE_OAUTH_ERROR', error: errorMsg },
              window.location.origin
            )
            window.close()
          } else {
            toast.error(errorMsg)
            navigate("/")
          }
      }
    })()
  }, [navigate, loadUser, isPopup])

  return <div className="p-6">Signing you in with Google…</div>
}
