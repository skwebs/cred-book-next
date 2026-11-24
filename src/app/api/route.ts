import { Readable, Writable } from 'node:stream';
import type { IncomingHttpHeaders } from 'node:http';
import type { NextRequest } from 'next/server';
import legacyHandler from '../../../api/index';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/** Adapt the existing Vercel Node handler to the Next.js Route Handler API.
 * Keeping the original handler avoids changing financial/API behaviour in
 * the framework migration. Multipart uploads remain streamed to Busboy.
 */
async function dispatch(request: NextRequest): Promise<Response> {
  const headers: IncomingHttpHeaders = {};
  request.headers.forEach((value, key) => { headers[key.toLowerCase()] = value; });

  const incoming = request.body
    ? Readable.fromWeb(request.body as import('node:stream/web').ReadableStream)
    : Readable.from([]);
  Object.assign(incoming, {
    url: `${request.nextUrl.pathname}${request.nextUrl.search}`,
    method: request.method,
    headers,
    socket: { remoteAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown' },
  });

  const responseHeaders = new Headers();
  const chunks: Buffer[] = [];
  let statusCode = 200;
  let ended = false;
  let finish!: () => void;
  const finished = new Promise<void>((resolve) => { finish = resolve; });
  const outgoing = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      callback();
    },
    final(callback) { ended = true; finish(); callback(); },
  }) as Writable & {
    statusCode: number;
    setHeader(name: string, value: string | number | readonly string[]): void;
    getHeader(name: string): string | number | readonly string[] | undefined;
  };
  Object.defineProperty(outgoing, 'statusCode', {
    get: () => statusCode,
    set: (value: number) => { statusCode = value; },
  });
  outgoing.setHeader = (name, value) => {
    if (Array.isArray(value)) responseHeaders.delete(name);
    if (Array.isArray(value)) value.forEach((item) => responseHeaders.append(name, String(item)));
    else responseHeaders.set(name, String(value));
  };
  outgoing.getHeader = (name) => responseHeaders.get(name) ?? undefined;

  try {
    await legacyHandler(incoming as never, outgoing as never);
    // The receipt download branch pipes an R2 stream directly into the
    // response. Do not end that stream when the legacy handler returns.
    const isStreamingDownload = responseHeaders.has('Content-Disposition');
    if (!ended && !isStreamingDownload) outgoing.end();
    await finished;
  } catch (error) {
    console.error('Legacy API adapter failure:', error);
    if (!ended) {
      statusCode = 500;
      chunks.length = 0;
      chunks.push(Buffer.from(JSON.stringify({ error: 'A server error occurred.' })));
      outgoing.setHeader('Content-Type', 'application/json; charset=utf-8');
      outgoing.end();
      await finished;
    }
  }

  return new Response(Buffer.concat(chunks), { status: statusCode, headers: responseHeaders });
}

export const GET = dispatch;
export const POST = dispatch;
export const PUT = dispatch;
export const PATCH = dispatch;
export const DELETE = dispatch;
