'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { authenticate } from '@/app/login/actions'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { getMessageFromCode } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from './ui/button'
import { GitHubLogoIcon } from '@radix-ui/react-icons'

export default function LoginForm() {
  const router = useRouter()
  const [result, dispatch] = useFormState(authenticate, undefined)

  useEffect(() => {
    if (result) {
      if (result.type === 'error') {
        toast.error(getMessageFromCode(result.resultCode))
      } else {
        toast.success(getMessageFromCode(result.resultCode))
        router.refresh()
      }
    }
  }, [result, router])

  return (
    <form
      action={dispatch}
      className="flex flex-col items-center gap-4 space-y-3"
    >
      <div className="w-full flex-1 rounded-lg border bg-white px-6 pb-4 pt-8 shadow-md  md:w-96 dark:bg-zinc-950">
        <h1 className="mb-3 text-2xl font-bold">Please log in to continue.</h1>
        <div className="w-full">
          <Button
            variant="outline"
            onClick={() => signIn('github')}
            style={{ width: '100%' }}
          >
            <GitHubLogoIcon
              style={{
                marginRight: '0.5rem'
              }}
            />
            Continue with GitHub
          </Button>
        </div>
      </div>
    </form>
  )
}
