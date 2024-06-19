'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { type Chat } from '@/lib/types'
import db from '@/lib/db'
import { chatModel } from '@/lib/model'
import { eq, and } from 'drizzle-orm'

export async function getChats(userId?: string | null): Promise<Chat[]> {
  if (!userId) {
    return []
  }

  try {
    const chats = await db
      .select()
      .from(chatModel)
      .where(eq(chatModel.userId, userId))

    return chats as any
  } catch (error) {
    return []
  }
}

export async function getChat(
  id: string,
  userId: string
): Promise<Chat | null> {
  const chats = await db
    .select()
    .from(chatModel)
    .where(and(eq(chatModel.id, id), eq(chatModel.userId, userId)))
    .limit(1)

  if (chats.length === 0) {
    return null
  }

  return chats[0] as any
}

export async function removeChat({
  id,
  path
}: {
  id: string
  path: string
}): Promise<void | { error: string }> {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  //Convert uid to string for consistent comparison with session.user.id
  const result = await db
    .select()
    .from(chatModel)
    .where(eq(chatModel.id, id))
    .limit(1)

  if (result.length === 0) {
    return
  }

  const chat = result[0]

  if (chat.userId !== session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  await db.delete(chatModel).where(eq(chatModel.id, id))

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

  await db.delete(chatModel).where(eq(chatModel.userId, session.user.id))

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string): Promise<Chat | null> {
  const result = await db
    .select()
    .from(chatModel)
    .where(eq(chatModel.id, id))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  const chat = result[0]

  if (!chat.sharePath) {
    return null
  }

  return chat as any
}

export async function shareChat(id: string): Promise<Chat | { error: string }> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const result = await db
    .select()
    .from(chatModel)
    .where(eq(chatModel.id, id))
    .limit(1)

  if (result.length === 0) {
    return {
      error: 'Something went wrong'
    }
  }

  const chat = result[0]

  if (chat.userId !== session.user.id) {
    return {
      error: 'Something went wrong'
    }
  }

  const sharePath = `/share/${chat.id}`

  await db
    .update(chatModel)
    .set({
      sharePath
    })
    .where(eq(chatModel.id, id))

  return {
    ...chat,
    sharePath
  } as any
}

export async function saveChat(c: Chat): Promise<void> {
  const session = await auth()

  if (session && session.user) {
    const newChat = {
      id: c.id,
      title: c.title,
      createdAt: new Date(),
      userId: session.user.id!,
      path: c.path,
      messages: c.messages as any,
      sharePath: c.sharePath
    }

    const result = await db
      .select()
      .from(chatModel)
      .where(eq(chatModel.id, c.id))
      .limit(1)

    if (result.length !== 0) {
      await db.update(chatModel).set(newChat).where(eq(chatModel.id, c.id))
    } else {
      await db.insert(chatModel).values(newChat)
    }
  } else {
    return
  }
}

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = ['GOOGLE_GENERATIVE_AI_API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}
