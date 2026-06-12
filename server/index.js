const net = require("net");
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const TCP_PORT = 8888;
const HTTP_PORT = 8080;
const PUBLIC_DIR = path.join(__dirname, "..", "public");

// ── 编码自动检测 ──────────────────────────────────────
const decoderUTF8 = new TextDecoder("utf-8", { fatal: false });
const decoderGBK = new TextDecoder("gbk");

function decodeData(buf) {
  // 先尝试 UTF-8
  const utf8 = decoderUTF8.decode(buf);
  // 如果出现替换字符 U+FFFD，说明不是 UTF-8，用 GBK 重新解码
  if (utf8.includes("\uFFFD")) {
    return decoderGBK.decode(buf);
  }
  return utf8;
}

// ── TCP 服务端 ────────────────────────────────────────
let stm32Client = null;

function startTCPServer() {
  const tcpServer = net.createServer((socket) => {
    const addr = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`[TCP] ✅ STM32 已连接 (${addr})`);
    broadcast({ type: "status", message: "STM32 已连接" });

    if (stm32Client) { stm32Client.destroy(); }
    stm32Client = socket;

    let buffer = "";
    socket.on("data", (data) => {
      // 用 decodeData 自动识别 GBK / UTF-8
      buffer += decodeData(data);

      const parts = buffer.split(/\r\n|\n\r|\n|\r/);
      buffer = parts.pop();

      for (const msg of parts) {
        if (msg.length > 0) {
          const trimmed = msg.trim();
          if (trimmed) {
            console.log(`[TCP → WS] ${trimmed}`);
            broadcast({ type: "data", payload: trimmed });
          }
        }
      }
    });

    socket.on("close", () => {
      console.log(`[TCP] STM32 已断开`);
      broadcast({ type: "status", message: "等待 STM32 连接..." });
      if (stm32Client === socket) stm32Client = null;
    });

    socket.on("error", (err) => {
      console.error(`[TCP] 连接错误: ${err.message}`);
    });
  });

  tcpServer.listen(TCP_PORT, "0.0.0.0", () => {
    console.log(`[TCP] 正在监听端口 ${TCP_PORT}，等待 STM32 连接...`);
  });

  tcpServer.on("error", (err) => {
    console.error(`[TCP] 服务器错误: ${err.message}`);
  });
}

// ── WebSocket ─────────────────────────────────────────
const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const clients = new Set();

function createWSFrame(payload, opcode = 0x1) {
  const buf = Buffer.from(payload, "utf-8");
  const len = buf.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x80 | opcode;
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  return Buffer.concat([header, buf]);
}

function parseWSFrame(buffer) {
  if (buffer.length < 2) return null;
  const opcode = buffer[0] & 0x0F;
  const masked = (buffer[1] & 0x80) !== 0;
  let payloadLen = buffer[1] & 0x7F;
  let offset = 2;
  if (payloadLen === 126) {
    if (buffer.length < 4) return null;
    payloadLen = buffer.readUInt16BE(2);
    offset = 4;
  } else if (payloadLen === 127) {
    if (buffer.length < 10) return null;
    payloadLen = Number(buffer.readBigUInt64BE(2));
    offset = 10;
  }
  const maskLen = masked ? 4 : 0;
  const totalLen = offset + maskLen + payloadLen;
  if (buffer.length < totalLen) return null;
  let payload;
  if (masked) {
    const maskKey = buffer.slice(offset, offset + 4);
    payload = Buffer.alloc(payloadLen);
    for (let i = 0; i < payloadLen; i++)
      payload[i] = buffer[offset + 4 + i] ^ maskKey[i % 4];
  } else {
    payload = buffer.slice(offset + maskLen, offset + maskLen + payloadLen);
  }
  return { opcode, payload, totalLen };
}

// ── HTTP ──────────────────────────────────────────────
const server = http.createServer((req, res) => {
  let filePath = path.join(PUBLIC_DIR, req.url === "/" ? "index.html" : req.url);
  if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); res.end("Forbidden"); return; }
  const ext = path.extname(filePath);
  const mimeMap = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
  };
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); res.end("Not Found"); }
    else { res.writeHead(200, { "Content-Type": mimeMap[ext] || "text/plain" }); res.end(content); }
  });
});

server.on("upgrade", (req, socket, head) => {
  const key = req.headers["sec-websocket-key"];
  if (!key) { socket.destroy(); return; }
  const accept = crypto.createHash("sha1").update(key + WS_GUID).digest("base64");
  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\n" +
    "Upgrade: websocket\r\nConnection: Upgrade\r\n" +
    `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  );
  console.log(`[WS] 新客户端连接 (当前 ${clients.size + 1} 个)`);
  socket.write(createWSFrame(JSON.stringify({
    type: "status",
    message: stm32Client ? "STM32 已连接" : "等待 STM32 连接...",
  })));

  let buffer = Buffer.alloc(0);
  socket.on("data", (data) => {
    buffer = Buffer.concat([buffer, data]);
    while (buffer.length > 0) {
      const frame = parseWSFrame(buffer);
      if (!frame) break;
      buffer = buffer.slice(frame.totalLen);
      if (frame.opcode === 0x8) { clients.delete(socket); socket.end(); return; }
      if (frame.opcode === 0x9) { socket.write(createWSFrame(frame.payload, 0xA)); continue; }
      if (frame.opcode === 0x1) {
        const text = frame.payload.toString("utf-8");
        console.log(`[WS → TCP] ${text}`);
        if (stm32Client && !stm32Client.destroyed) {
          stm32Client.write(text + "\r\n");
        } else {
          socket.write(createWSFrame(JSON.stringify({ type: "status", message: "STM32 未连接" })));
        }
      }
    }
  });

  socket.on("close", () => { clients.delete(socket); console.log(`[WS] 断开 (剩余 ${clients.size})`); });
  socket.on("error", () => clients.delete(socket));
  clients.add(socket);
});

function broadcast(data) {
  const json = JSON.stringify(data);
  for (const ws of clients) {
    try { ws.write(createWSFrame(json)); } catch (e) { /* ignore */ }
  }
}

// ── 启动 ───────────────────────────────────────────────
startTCPServer();
server.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(`[HTTP] 网页服务 → http://localhost:${HTTP_PORT}`);
});
