# 水下机器人 - W5500 以太网通信系统

## 系统架构

```
┌──────────────┐   WebSocket   ┌──────────────────┐   TCP (主动连接)  ┌──────────────┐
│ 网页前端      │ ◄──────────► │ Node.js 中转服务  │ ◄────────────── │ STM32 + W5500│
│ (浏览器)      │              │ (localhost:8080)  │                  │ G431CBT6     │
└──────────────┘              └──────────────────┘                  │ 192.168.1.55 │
                                                                     └──────────────┘
```

---

## 硬件接线

### STM32G431CBT6 ←→ W5500 模块 (SPI1)

| W5500 引脚 | G431 引脚 | 说明 |
|---|---|---|
| SCK | PA5 | SPI1 时钟 |
| MISO | PA6 | SPI1 主入从出 |
| MOSI | PA7 | SPI1 主出从入 |
| SCS (CS) | PA4 | 片选 (软件 NSS) |
| RST | PB0 | 复位 |
| VCC | 3.3V | 电源 |
| GND | GND | 地 |

### ST-Link 烧录

| ST-Link | G431 板子 |
|---|---|
| GND | GND |
| SWCLK | PA14 |
| SWDIO | PA13 |
| 3.3V | VDD (可不接) |

---

## STM32 网络参数配置

### 修改 IP 地址和端口

打开 `Src/main.c`，修改以下变量：

```c
/* 远程主机 (PC) IP 地址 */
uint8_t  remote_ip[4] = {192, 168, 1, 100};

/* 网关地址 */
uint8_t  Gateway_ip[4] = {192, 168, 1, 1};

/* STM32 本机 IP 地址 */
uint8_t  Board_ip[4] = {192, 168, 1, 55};

/* 本地端口 (STM32 监听端口) */
uint16_t local_port = 8888;

/* 远程端口 (PC 监听端口) */
uint16_t remote_port = 8888;
```

### 修改 MAC 地址

打开 `Src/wizchip_conf.c`，修改 MAC：

```c
wiz_NetInfo gWIZNETINFO = {
    .mac = {0x00, 0x83, 0x68, 0x88, 0x56, 0x72},  // ← 改这里
    .sn  = {255, 255, 255, 0},  // 子网掩码
    .dhcp = NETINFO_STATIC       // 静态 IP
};
```

> **注意**：多块板子同时使用时 MAC 地址不能重复。

### 修改子网掩码

如果不在 192.168.1.x 网段，需要同时修改 `Sn` 和网关：

```c
.Sn  = {255, 255, 255, 0},   // 子网掩码
.gw  = {192, 168, 1, 1},     // 网关 (运行时会拷贝 Gateway_ip)
```

---

## PC 端 - Node.js 中转服务

### 启动

```powershell
cd C:\Users\shejiahan\Desktop\嵌赛\server
node index.js
```

浏览器打开 `http://localhost:8080`

### 工作原理

1. PC 在 **0.0.0.0:8888** 监听 TCP，等待 STM32 主动连接
2. STM32 上电 → W5500 初始化 → TCP 连接到 PC 的 8888 端口
3. PC 收到连接后，创建一个 **WebSocket 服务** (localhost:8080)
4. 数据流向：
   - **STM32 → PC → 网页**：W5500 发来的数据通过 WebSocket 转发到浏览器
   - **网页 → PC → STM32**：浏览器发送的指令通过 TCP 转发到 W5500

### 通信协议

- **传输层**：TCP
- **消息格式**：纯文本
- **消息分隔符**：`\r\n`、`\n\r`、`\n`、`\r` 均可
- **发送频率**：STM32 约 1 条/秒

---

## 烧录步骤

1. 打开 Keil uVision，打开 `MDK-ARM\G431.uvprojx`
2. **F7** 编译
3. ST-Link 接好板子 (GND + SWCLK + SWDIO)
4. 首次烧录需确认 Flash 算法：
   - Debug 设置 → Settings → Flash Download → Add → **STM32G4xx_128.FLM**
5. **F8** 烧录

---

## 调试

### W5500 连接状态

在 `Src/main.c` 中，`Net_Status` 变量反映了 TCP socket 状态：

| 状态 | 含义 |
|---|---|
| `SOCK_CLOSED` | Socket 关闭，调用 socket() 创建 |
| `SOCK_INIT` | Socket 已初始化，调用 connect() 连接 |
| `SOCK_ESTABLISHED` | 连接成功，收发数据 |
| `SOCK_CLOSE_WAIT` | 远端断开，调用 close() 关闭 |

### 常见问题

1. **PC 收不到数据** → 检查 PC 防火墙是否允许 8888 端口
2. **W5500 连不上** → 检查网线是否插好，IP 是否在同一网段
3. **LED 不亮** → 检查 W5500 的 3.3V 供电
4. **编译失败** → 确认 Keil 安装了 `Keil.STM32G4xx_DFP.1.2.0`

### 最小配置变更示例

假设改成 `192.168.2.x` 网段：

**main.c：**
```c
uint8_t  remote_ip[4] = {192, 168, 2, 100};  // PC
uint8_t  Gateway_ip[4] = {192, 168, 2, 1};    // 网关
uint8_t  Board_ip[4]  = {192, 168, 2, 55};    // STM32
```

**wizchip_conf.c：**
```c
.Sn  = {255, 255, 255, 0},
```

**PC 网卡 IP：** 改为 `192.168.2.100`

---

## 项目文件结构

```
嵌赛/
├── AGENTS.md                        # 项目说明
├── README.md                        # 本文件
├── start.ps1                        # 一键启动脚本
├── server/
│   ├── index.js                     # Node.js 中转服务
│   └── package.json
├── public/
│   ├── index.html                   # 网页前端
│   ├── style.css
│   └── app.js
└── W5500以太网模块通信实验（HAL库）/
    ├── Inc/                         # 头文件
    │   ├── main.h                   # 主头文件 (引用 stm32g4xx_hal.h)
    │   ├── spi.h                    # SPI1 声明
    │   ├── gpio.h                   # GPIO 声明
    │   ├── stm32g4xx_hal_conf.h     # HAL 模块配置
    │   ├── stm32g4xx_it.h           # 中断声明
    │   ├── w5500.h                  # W5500 驱动
    │   ├── socket.h                 # WIZnet Socket API
    │   └── wizchip_conf.h           # WIZnet 芯片配置
    ├── Src/                         # 源文件
    │   ├── main.c                   # ★ 主程序 + 时钟 + 网络参数
    │   ├── spi.c                    # SPI1 初始化
    │   ├── gpio.c                   # CS/RST 引脚初始化
    │   ├── system_stm32g4xx.c       # 系统初始化 (FPU)
    │   ├── stm32g4xx_it.c           # 中断服务
    │   ├── stm32g4xx_hal_msp.c      # HAL MSP
    │   ├── w5500.c                  # W5500 寄存器操作
    │   ├── socket.c                 # WIZnet Socket 实现
    │   └── wizchip_conf.c           # ★ WIZnet 回调 + 网络配置
    ├── Drivers/
    │   ├── STM32G4xx_HAL_Driver/    # G4 HAL 库
    │   └── CMSIS/                   # CMSIS
    └── MDK-ARM/
        ├── G431.uvprojx             # Keil 工程文件
        └── startup_stm32g431xx.s    # 启动文件
```

---

## 关键配置速查

| 配置项 | 位置 | 默认值 |
|---|---|---|
| STM32 IP | `Src/main.c` → `Board_ip` | `192.168.1.55` |
| PC IP | `Src/main.c` → `remote_ip` | `192.168.1.100` |
| 端口 | `Src/main.c` → `local_port` / `remote_port` | `8888` |
| MAC | `Src/wizchip_conf.c` → `gWIZNETINFO.mac` | `00:83:68:88:56:72` |
| 子网掩码 | `Src/wizchip_conf.c` → `gWIZNETINFO.Sn` | `255.255.255.0` |
| PC TCP 端口 | `server/index.js` → `TCP_PORT` | `8888` |
| 网页端口 | `server/index.js` → `HTTP_PORT` | `8080` |
| 时钟 | `Src/main.c` → `SystemClock_Config` | HSE 8MHz → 168MHz |

---

## PC 端启动中转服务

### 方法一：双击 start.bat（最简单）

直接双击 `C:\Users\shejiahan\Desktop\嵌赛\start.bat` 即可。

### 方法二：直接运行 Node.js

```powershell
cd C:\Users\shejiahan\Desktop\嵌赛\server
node index.js
```

### 方法三：Win + R 快速启动

按 `Win + R`，粘贴：

```
powershell -NoExit -Command "cd C:\Users\shejiahan\Desktop\嵌赛\server; node index.js"
```

### 验证是否成功

看到以下输出说明启动正常：

```
TCP 服务已启动 :8888
HTTP 服务已启动 :8080
等待 STM32 连接...
```

### 访问网页

浏览器打开 [http://localhost:8080](http://localhost:8080)

### 关闭服务

按 `Ctrl + C` 停止中转服务。

