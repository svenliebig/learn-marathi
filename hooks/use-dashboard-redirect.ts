import { isLoggedIn } from '@/lib/services/auth/actions'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useDashboardRedirect() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkLoggedIn = async () => {
      if (await isLoggedIn()) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setIsLoading(false)
      }
    }
    checkLoggedIn()
  }, [router])

  return isLoading
}
