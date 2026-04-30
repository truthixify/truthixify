import { revalidateTag } from 'next/cache'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

async function verifySignature(request: NextRequest, body: string): Promise<boolean> {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) return false

  const signature = request.headers.get('x-hub-signature-256')
  if (!signature) return false

  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const valid = await verifySignature(request, body)

  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  revalidateTag('journals')
  revalidatePath('/journals')
  revalidatePath('/')

  return NextResponse.json({ revalidated: true, now: Date.now() })
}
