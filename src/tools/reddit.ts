import type { ToolFn } from '../../types'
import { z } from 'zod'
import fetch from 'node-fetch'

export const redditToolDefinition = {
  name: 'reddit',
  parameters: z.object({}),
  description: 'get the latest posts from Reddit',
}

type Args = z.infer<typeof redditToolDefinition.parameters>

export const reddit: ToolFn<Args, string> = async ({ toolArgs }) => {
  try {
    const response = await fetch('https://www.reddit.com/r/niceguys/.json', {
      headers: {
        'User-Agent': 'charlesErrington',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new TypeError("Oops, we haven't got JSON!")
    }

    const data = await response.json()
    const relevantInfo = data.data.children.map((child: any) => ({
      title: child.data.title,
      link: child.data.url,
      subreddit: child.data.subreddit_name_prefixed,
      author: child.data.author,
      upvotes: child.data.ups,
    }))

    return JSON.stringify(relevantInfo, null, 2)
  } catch (error) {
    console.error('Fetch error:', error)
    throw error // Re-throw so it can be handled by the caller
  }
}
