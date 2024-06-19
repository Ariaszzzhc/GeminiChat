import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  json
} from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'
import { Message } from './types'

export const userModel = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image')
})

export const accountModel = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => userModel.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state')
  },
  account => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId]
    })
  })
)

export const sessionModel = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userModel.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull()
})

export const verificationTokenModel = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull()
  },
  verificationToken => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token]
    })
  })
)

export const authenticatorModel = pgTable(
  'authenticators',
  {
    credentialID: text('credential_id').notNull().unique(),
    userId: text('user_id')
      .notNull()
      .references(() => userModel.id, { onDelete: 'cascade' }),
    providerAccountId: text('provider_account_id').notNull(),
    credentialPublicKey: text('credential_public_key').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credential_device_type').notNull(),
    credentialBackedUp: boolean('credential_backed_up').notNull(),
    transports: text('transports')
  },
  authenticator => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID]
    })
  })
)

export const chatModel = pgTable('chats', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => userModel.id, { onDelete: 'cascade' }),
  path: text('path').notNull(),
  messages: json('messages').$type<Message[]>().notNull(),
  sharePath: text('share_path')
})
