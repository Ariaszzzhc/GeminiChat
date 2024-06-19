import { ExternalLink } from '@/components/external-link'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">Welcome to Arias AI Chatbot!</h1>
        <p className="leading-normal text-muted-foreground">
          This is an open source AI chatbot app template built with{' '}
          <ExternalLink href="https://nextjs.org">Next.js</ExternalLink>, the{' '}
          <ExternalLink href="https://sdk.vercel.ai">
            Vercel AI SDK
          </ExternalLink>
          , <ExternalLink href="https://www.prisma.io/">Drizzle</ExternalLink>
          and{' '}
          <ExternalLink href="https://mongodb.com/">PostgreSql</ExternalLink>.
        </p>
        <p className="leading-normal text-muted-foreground">
          It uses{' '}
          <ExternalLink href="https://vercel.com/blog/ai-sdk-3-generative-ui">
            React Server Components
          </ExternalLink>{' '}
          to combine text with generative UI as output of the LLM. The UI state
          is synced through the SDK so the model is aware of your interactions
          as they happen.
        </p>
      </div>
    </div>
  )
}
