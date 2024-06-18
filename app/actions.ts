'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { type Chat } from '@/lib/types'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { chat } from '@/lib/schema'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const chats = await db.query.chat.findMany({
      where: eq(chat.userId, userId)
    })

    return chats as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string) {
  const c = await db.query.chat.findFirst({
    where: eq(chat.id, id)
  })

  if (!c || (userId && c!.userId !== userId)) {
    return null
  }

  return c as Chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  //Convert uid to string for consistent comparison with session.user.id
  const result = await db
    .select({
      uid: chat.userId
    })
    .from(chat)
    .where(eq(chat.id, id))

  const uid = result[0]?.uid ?? ''

  if (uid !== session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  await db.delete(chat).where(eq(chat.id, id))

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const ids = (
    await db
      .select({
        id: chat.id
      })
      .from(chat)
      .where(eq(chat.userId, session.user.id))
  ).map(c => c.id)

  if (!ids.length) {
    return redirect('/')
  }

  for (const id of ids) {
    db.delete(chat).where(eq(chat.id, id))
  }

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string) {
  const c = await db.query.chat.findFirst({ where: eq(chat.id, id) })

  if (!c || !c.sharePath) {
    return null
  }

  return c as Chat
}

export async function shareChat(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  // const chat = await kv.hgetall<Chat>(`chat:${id}`)
  const c = await db.query.chat.findFirst({ where: eq(chat.id, id) })

  if (!c || c.userId !== session.user.id) {
    return {
      error: 'Something went wrong'
    }
  }

  const sharePath = `/share/${chat.id}`

  await db
    .update(chat)
    .set({
      sharePath
    })
    .where(eq(chat.id, id))

  return {
    ...c,
    sharePath
  } as Chat
}

export async function saveChat(c: Chat) {
  const session = await auth()

  if (session && session.user) {
    const newChat: typeof chat.$inferInsert = {
      id: c.id,
      title: c.title,
      createdAt: new Date(),
      userId: session.user.id!,
      path: c.path,
      messages: c.messages
    }

    await db.insert(chat).values(newChat)
  } else {
    return
  }
}

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = ['OPENAI_API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}
