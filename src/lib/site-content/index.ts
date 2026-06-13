import { cache } from 'react'
import { getStoredSiteContentJson, saveStoredSiteContentJson } from '../db'
import { DEFAULT_SITE_CONTENT } from './defaults'
import type { SiteContent } from './types'

function mergeContent(base: SiteContent, patch: Partial<SiteContent>): SiteContent {
  return { ...base, ...patch } as SiteContent
}

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const stored = getStoredSiteContentJson()
  if (!stored) return DEFAULT_SITE_CONTENT
  return mergeContent(DEFAULT_SITE_CONTENT, stored)
})

export async function saveSiteContent(patch: Partial<SiteContent>) {
  const current = await getSiteContent()
  const next = mergeContent(current, patch)
  saveStoredSiteContentJson(next)
  return next
}

export { DEFAULT_SITE_CONTENT }
