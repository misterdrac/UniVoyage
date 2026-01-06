import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { apiService } from "@/services/api"
import { toast } from "sonner"
import { useAuth } from "@/contexts"
import { Spinner } from "@/components/ui/spinner"
import { LogIn } from "lucide-react"
import univoyageIcon from '@/assets/univoyage_icon.svg'
import { ROUTE_PATHS } from "@/config/routes"


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
        navigate(ROUTE_PATHS.HOME)
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
        navigate(ROUTE_PATHS.HOME)
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
                navigate(ROUTE_PATHS.HOME)
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
            navigate(redirectUrl || ROUTE_PATHS.HOME)
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
            navigate(ROUTE_PATHS.HOME)
          }
      }
    })()
  }, [navigate, loadUser, isPopup])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src={univoyageIcon} alt="UniVoyage Logo" className="w-10 h-10 sm:w-12 sm:h-12" />
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
            <div className="relative p-4 rounded-full bg-primary/10 border-2 border-primary/20">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            Signing you in with Google
          </h2>
          <p className="text-muted-foreground">
            Please wait while we complete your authentication...
          </p>
        </div>
        <div className="flex justify-center pt-2">
          <Spinner className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  )
}
