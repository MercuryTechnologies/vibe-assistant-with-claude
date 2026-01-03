import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  res.status(200).json({ message: 'Hello from test!', method: req.method })
}

