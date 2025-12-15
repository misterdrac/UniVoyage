import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { apiService } from "@/services/api"
import { toast } from "sonner"
import { useAuth } from "@/contexts"


export default function GoogleCallbackPage() {
  const navigate = useNavigate()
  const { loadUser } = useAuth()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    const error = params.get("error")

    if (error) {
      toast.error(`Google auth error: ${error}`)
      navigate("/")
      return
    }
    if (!code) {
      toast.error("Missing Google authorization code")
      navigate("/")
      return
    }

    ;(async () => {
      try {
          const res = await apiService.googleCallback(code)

          if (!res.success) {
              toast.error(res.error || "Google login failed")
              navigate("/")
              return
          }

          await loadUser()

          // Get stored redirect URL or default to home
          const redirectUrl = sessionStorage.getItem('google_oauth_redirect')
          sessionStorage.removeItem('google_oauth_redirect')

          toast.success("Signed in with Google!")
          navigate(redirectUrl || "/")
      } catch (e: any) {
          toast.error(e?.message || "Google login failed")
          navigate("/")
      }
    })()
  }, [navigate, loadUser])

  return <div className="p-6">Signing you in with Google…</div>
}
