import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import path from "path";

const app = new Hono()

const PORT = 3000;
const VIDEO_DIR = path.join(__dirname, "./videos");
const PUBLIC_DIR = path.join(import.meta.dir, "../web/public");
const ALLOWED_EXTENSIONS = [".mp4", ".mkv"];

const MIME_TYPES: { [key: string]: string } = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
};

// Serve static files for now.
app.use('/*', serveStatic({ root: PUBLIC_DIR }))

// Video list endpoint
app.get('/videos', async (c) => {
  try {
    const files = await Array.fromAsync(
      new Bun.Glob("*.{mp4,mkv,avi,webm}").scan(VIDEO_DIR) // MKV doesn't work in iOS Safari. Need to convert mkv to a suitable format. Probably spin up a node for conversion.
    );
    return c.json(files);
  } catch (error) {
    return c.json({ error: "Error reading videos" }, 500);
  }
});

// Video streaming endpoint
app.get('/stream/:filename', async (c) => {
  const filename = c.req.param('filename');
  const videoPath = path.join(VIDEO_DIR, filename);
  const ext = path.extname(videoPath);

  // Security check
  if (!videoPath.startsWith(VIDEO_DIR)) {
    return c.text('Forbidden', 403);
  }
  
  try {
    const file = Bun.file(videoPath);

    if (!(await file.exists())) {
      return c.text('Video not found', 404);
    }

    const range = c.req.header('range');
    const fileSize = file.size;
    const contentType = MIME_TYPES[ext] || 'video/mp4';

    if (range) {
      // Handle range requests for seeking
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0] ?? "", 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const stream = file.slice(start, end + 1);

      return new Response(stream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': contentType,
        },
      });
    } else {
      return new Response(file, {
        headers: {
          'Content-Length': fileSize.toString(),
          'Content-Type': contentType,
        },
      });
    }

  } catch (error) {
    return c.text('Error streaming video', 500);
  }
})

export default {
  port: PORT,
  fetch: app.fetch,
}