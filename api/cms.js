// CMS API — save/list/delete blog posts in Vercel KV, trigger redeploy
const KV_URL   = process.env.KV_REST_API_URL
const KV_TOKEN = process.env.KV_REST_API_TOKEN
const DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK  // set in Vercel dashboard
const POSTS_KEY = 'sf_blog_posts'

async function kvGet(key) {
  const r = await fetch(`${KV_URL}/get/${key}`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } })
  const j = await r.json()
  return j.result ? JSON.parse(j.result) : []
}
async function kvSet(key, value) {
  await fetch(`${KV_URL}/set/${key}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(JSON.stringify(value))
  })
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'GET') {
    const posts = await kvGet(POSTS_KEY)
    return res.json(posts)
  }

  if (req.method === 'POST') {
    const { action, post, id } = req.body
    let posts = await kvGet(POSTS_KEY)

    if (action === 'save' || action === 'publish') {
      const idx = posts.findIndex(p => p.id === post.id)
      if (idx >= 0) posts[idx] = post; else posts.unshift(post)
      await kvSet(POSTS_KEY, posts)

      // Trigger Vercel redeploy
      if (action === 'publish' && DEPLOY_HOOK) {
        await fetch(DEPLOY_HOOK, { method: 'POST' }).catch(() => {})
      }
      return res.json({ ok: true, posts })
    }

    if (action === 'delete') {
      posts = posts.filter(p => p.id !== id)
      await kvSet(POSTS_KEY, posts)
      return res.json({ ok: true, posts })
    }

    return res.status(400).json({ error: 'Unknown action' })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
