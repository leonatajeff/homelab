import http from "http";
import fs from "fs";
import path from "path";
// import mdns from 'mdns';

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "../public");
const VIDEO_DIR = path.join(__dirname, "../videos");
const ALLOWED_EXTENSIONS = [".mp4", ".mkv"];

const MIME_TYPES: { [key: string]: string } = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  const url = req.url || "/";

  // Stream videos
  if (req.method === "GET" && url.startsWith("/stream/")) {
    const videoName = decodeURIComponent(url.split("/stream/")[1]);
    const videoPath = path.join(VIDEO_DIR, videoName);

    // Security check
    if (!videoPath.startsWith(VIDEO_DIR)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.stat(videoPath, (err, stats) => {
      if (err) {
        res.writeHead(404);
        res.end("Video not found");
        return;
      }

      const range = req.headers.range;
      const videoSize = stats.size;
      const ext = path.extname(videoPath);
      const contentType = MIME_TYPES[ext] || "video/mp4";

      if (range) {
        // Handle range requests for seeking
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;
        const chunksize = end - start + 1;

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${videoSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": contentType,
        });

        const stream = fs.createReadStream(videoPath, { start, end });
        stream.pipe(res);
      } else {
        res.writeHead(200, {
          "Content-Length": videoSize,
          "Content-Type": contentType,
        });
        fs.createReadStream(videoPath).pipe(res);
      }
    });
    return;
  }

  // List all videos
  if (req.method === "GET" && url === "/videos") {
    fs.readdir(VIDEO_DIR, (err, files) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Error reading videos" }));
        return;
      }
      const videos = files.filter((file) =>
        ALLOWED_EXTENSIONS.some((ext) => file.endsWith(ext))
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(videos));
    });
    return;
  }

  // Serve static UI files
  let filePath = path.join(
    PUBLIC_DIR,
    req.url === "/" ? "index.html" : req.url || ""
  );

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Not Found" }));
      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || "text/plain";
    res.writeHead(200, { "Content-Type": contentType });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
