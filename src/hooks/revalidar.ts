/**
 * Expires the public site's cached data when content changes in the admin,
 * so a published or edited article shows up without rebuilding the site.
 *
 * `revalidateTag` only works inside a Next.js request (admin panel, API,
 * scheduled-publish job endpoint). In scripts such as the seed there is no
 * request and nothing cached to expire, so failures are ignored.
 */
import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

const expirar = (tag: string): void => {
  try {
    // expire: 0 → the next visitor gets fresh content, never a stale page.
    revalidateTag(tag, { expire: 0 })
  } catch {
    // Not running inside Next.js (seed, tests, CLI).
  }
}

export const revalidarAlCambiar =
  (tag: string): CollectionAfterChangeHook =>
  ({ doc, req }) => {
    // Autosave fires every couple of seconds while someone types; drafts are
    // not public, so there is nothing to refresh until a real save/publish.
    if (!req.query?.autosave) expirar(tag)
    return doc
  }

export const revalidarAlBorrar =
  (tag: string): CollectionAfterDeleteHook =>
  ({ doc }) => {
    expirar(tag)
    return doc
  }

export const revalidarGlobal =
  (tag: string): GlobalAfterChangeHook =>
  ({ doc }) => {
    expirar(tag)
    return doc
  }
