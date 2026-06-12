// ── DOM 引用 ──────────────────────────────────────────
const statusBadge = document.getElementById("status-badge");
const dataList = document.getElementById("data-list");
const cmdInput = document.getElementById("cmd-input");
const cmdSend = document.getElementById("cmd-send");
const connInfo = document.getElementById("connection-info");
const quickBtns = document.querySelectorAll(".btn-quick");
const btnClear = document.getElementById("btn-clear");

// ── 清除输出 ───────────────────────────────────────────
btnClear.addEventListener("click", () => {
  dataList.innerHTML = "";
});

// ── WebSocket 连接 ─────────────────────────────────────
const protocol = location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `${protocol}//${location.host}`;
let ws = null;
let reconnectTimer = null;

function connectWS() {
  if (ws && ws.readyState === WebSocket.OPEN) return;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("[WS] 已连接");
    connInfo.textContent = "WebSocket: 已连接";
    clearTimeout(reconnectTimer);
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      handleMessage(msg);
    } catch {
      appendData(event.data);
    }
  };

  ws.onclose = () => {
    console.log("[WS] 断开，3 秒后重连...");
    connInfo.textContent = "WebSocket: 已断开，重连中...";
    setStatus("offline");
    reconnectTimer = setTimeout(connectWS, 3000);
  };

  ws.onerror = () => {
    ws.close();
  };
}

// ── 消息处理 ───────────────────────────────────────────
function handleMessage(msg) {
  switch (msg.type) {
    case "status":
      if (msg.message.includes("已连接")) {
        setStatus("online");
      } else {
        setStatus("busy", msg.message);
      }
      break;

    case "data":
      appendData(msg.payload);
      break;

    default:
      appendData(JSON.stringify(msg));
  }
}

function setStatus(state, tooltip) {
  statusBadge.className = `status-${state}`;
  if (state === "online") {
    statusBadge.textContent = "● 已连接";
    statusBadge.title = "";
  } else if (state === "busy") {
    statusBadge.textContent = `● ${tooltip || "异常"}`;
    statusBadge.title = tooltip || "";
  } else {
    statusBadge.textContent = "● 未连接";
    statusBadge.title = "";
  }
}

// ── 数据展示 ───────────────────────────────────────────
function appendData(text) {
  // 移除占位
  const placeholder = dataList.querySelector(".placeholder");
  if (placeholder) placeholder.remove();

  const item = document.createElement("div");
  item.className = "data-item";

  const time = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  const ts = document.createElement("span");
  ts.className = "timestamp";
  ts.textContent = time;

  const content = document.createElement("span");
  content.textContent = text;

  item.appendChild(ts);
  item.appendChild(content);
  dataList.prepend(item);

  // 最多保留 200 条
  while (dataList.children.length > 200) {
    dataList.lastChild.remove();
  }
}

// ── 发送指令 ───────────────────────────────────────────
function sendCommand(cmd) {
  if (!cmd.trim()) return;

  if (!ws || ws.readyState !== WebSocket.OPEN) {
    appendData("[系统] WebSocket 未连接，无法发送");
    return;
  }

  ws.send(cmd.trim());
  appendData(`[发送] ${cmd.trim()}`);
  cmdInput.value = "";
}

cmdSend.addEventListener("click", () => sendCommand(cmdInput.value));
cmdInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendCommand(cmdInput.value);
});

quickBtns.forEach((btn) => {
  btn.addEventListener("click", () => sendCommand(btn.dataset.cmd));
});

// ── 启动 ───────────────────────────────────────────────
connectWS();
