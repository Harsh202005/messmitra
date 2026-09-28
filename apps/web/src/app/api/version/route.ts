import { NextResponse } from 'next/server';

// Generates unique version ID for each deployment / build
const BUILD_VERSION =
  process.env.NEXT_PUBLIC_APP_VERSION ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
  `v-${Date.now()}`;

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      version: BUILD_VERSION,
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}
