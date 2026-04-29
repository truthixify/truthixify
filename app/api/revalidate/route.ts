import { revalidateTag } from 'next/cache'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret')
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  revalidateTag('journals')
  revalidatePath('/journals')
  revalidatePath('/')

  return NextResponse.json({ revalidated: true, now: Date.now() })
}
