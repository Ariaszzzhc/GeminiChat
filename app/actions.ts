'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { type Chat } from '@/lib/types'
import db from '@/lib/db'

export async function getChats(userId?: string | null): Promise<Chat[]> {
  if (!userId) {
    return []
  }

  try {
    const chats = await db.chat.findMany({
      where: {
        userId: userId!
      }
    })

    return chats as any
  } catch (error) {
    return []
  }
}

export async function getChat(
  id: string,
  userId: string
): Promise<Chat | null> {
  const chat = await db.chat.findFirst({
    where: {
      id,
      userId
    }
  })

  if (!chat) {
    return null
  }

  return chat as any
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
  const result = await db.chat.findFirst({
    where: {
      id
    }
  })

  if (!result) {
    return
  }

  if (result.userId !== session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  await db.chat.deleteMany({
    where: {
      id
    }
  })

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

  const chats = await db.chat.findMany({
    where: {
      userId: session.user.id
    }
  })

  if (!chats.length) {
    return redirect('/')
  }

  for (const chat of chats) {
    db.chat.deleteMany({
      where: {
        id: chat.id
      }
    })
  }

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string): Promise<Chat | null> {
  const chat = await db.chat.findFirst({
    where: {
      id
    }
  })

  if (!chat || !chat.sharePath) {
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

  const chat = await db.chat.findFirst({
    where: { id }
  })

  if (!chat || chat.userId !== session.user.id) {
    return {
      error: 'Something went wrong'
    }
  }

  const sharePath = `/share/${chat.id}`

  await db.chat.updateMany({
    where: {
      id
    },
    data: {
      sharePath
    }
  })

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

    const oldChat = await db.chat.findFirst({
      where: {
        id: c.id
      }
    })

    if (oldChat) {
      await db.chat.update({
        where: {
          dbId: oldChat.dbId
        },
        data: newChat
      })
    } else {
      await db.chat.create({
        data: newChat
      })
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
