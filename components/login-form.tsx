'use client'

import { signIn } from 'next-auth/react'
import { Button } from './ui/button'
import { GitHubLogoIcon } from '@radix-ui/react-icons'

export default function LoginForm() {
  return (
    <form className="flex flex-col items-center gap-4 space-y-3">
      <div className="w-full flex-1 rounded-lg border bg-white px-6 pb-4 pt-8 shadow-md  md:w-96 dark:bg-zinc-950">
        <h1 className="mb-3 text-2xl font-bold">Please log in to continue.</h1>
        <div className="w-full">
          <Button
            variant="outline"
            onClick={() => {
              'use server'
              signIn('github')
            }}
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
