"""
SLEEPMARK — APK Download Server
รัน: python serve.py
เปิด URL ที่แสดงในมือถือ (WiFi เดียวกัน) แล้วกด Download ได้เลย
"""

import http.server
import os
import shutil
import socket
import socketserver
import sys
from datetime import datetime
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
PORT    = 8000
APK_SRC = Path("android/app/build/outputs/apk/debug/app-debug.apk")
SERVE   = Path("_serve")          # temporary serve folder (gitignored)
APK_OUT = SERVE / "app-debug.apk"

# ── Helpers ───────────────────────────────────────────────────────────────────
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "localhost"

def fmt_size(path: Path) -> str:
    b = path.stat().st_size
    return f"{b / 1_048_576:.1f} MB" if b >= 1_048_576 else f"{b / 1_024:.0f} KB"

def fmt_time(path: Path) -> str:
    ts = path.stat().st_mtime
    return datetime.fromtimestamp(ts).strftime("%d %b %Y %H:%M")

# ── Check APK ─────────────────────────────────────────────────────────────────
if not APK_SRC.exists():
    print("\n  ❌  APK not found. Run  npm run apk:debug  first.\n")
    sys.exit(1)

# ── Prepare serve folder ──────────────────────────────────────────────────────
SERVE.mkdir(exist_ok=True)
shutil.copy2(APK_SRC, APK_OUT)

ip       = get_local_ip()
base_url = f"http://{ip}:{PORT}"
apk_url  = f"{base_url}/app-debug.apk"
size     = fmt_size(APK_OUT)
built_at = fmt_time(APK_OUT)

# ── Generate index.html ───────────────────────────────────────────────────────
html = f"""<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>SLEEPMARK — Download APK</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F0FBF7;
      font-family: system-ui, -apple-system, sans-serif;
      padding: 24px;
    }}
    .card {{
      background: white;
      border-radius: 24px;
      padding: 36px 32px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 4px 32px rgba(8,80,65,.10);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }}
    .logo {{
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }}
    .logo-icon {{
      width: 56px; height: 56px;
      background: #085041;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
    }}
    .logo-icon svg {{ width: 28px; height: 28px; }}
    h1 {{ font-size: 20px; font-weight: 800; color: #085041; letter-spacing: -.5px; }}
    p.sub {{ font-size: 12px; color: #9CA3AF; }}

    .qr-wrap {{
      background: #F8FFFE;
      border: 2px solid #E8F7F2;
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }}
    #qrcode canvas, #qrcode img {{ border-radius: 8px; }}
    .qr-label {{ font-size: 11px; color: #6B7280; }}

    .meta {{
      width: 100%;
      background: #F8FFFE;
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }}
    .meta-row {{
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }}
    .meta-row span:first-child {{ color: #9CA3AF; }}
    .meta-row span:last-child  {{ color: #374151; font-weight: 600; }}

    .btn {{
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 16px;
      background: #1D9E75;
      color: white;
      font-size: 16px;
      font-weight: 700;
      border-radius: 14px;
      text-decoration: none;
      transition: background .2s, transform .1s;
      letter-spacing: -.2px;
    }}
    .btn:hover  {{ background: #178a64; }}
    .btn:active {{ transform: scale(.97); }}

    .url-box {{
      width: 100%;
      background: #F3F4F6;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 11px;
      color: #6B7280;
      word-break: break-all;
      text-align: center;
      font-family: monospace;
    }}
    .tip {{ font-size: 11px; color: #9CA3AF; text-align: center; line-height: 1.6; }}
  </style>
</head>
<body>
  <div class="card">
    <!-- Logo -->
    <div class="logo">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" fill="white">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </div>
      <h1>SLEEPMARK</h1>
      <p class="sub">Sleep Environment Dashboard</p>
    </div>

    <!-- QR Code -->
    <div class="qr-wrap">
      <div id="qrcode"></div>
      <p class="qr-label">สแกนด้วยมือถือเพื่อโหลด APK</p>
    </div>

    <!-- File info -->
    <div class="meta">
      <div class="meta-row"><span>ไฟล์</span><span>app-debug.apk</span></div>
      <div class="meta-row"><span>ขนาด</span><span>{size}</span></div>
      <div class="meta-row"><span>Build เมื่อ</span><span>{built_at}</span></div>
    </div>

    <!-- Download button -->
    <a class="btn" href="/app-debug.apk" download="SLEEPMARK.apk">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Download APK ({size})
    </a>

    <!-- URL -->
    <div class="url-box">{apk_url}</div>

    <p class="tip">
      มือถือและคอมต้องอยู่ใน WiFi เดียวกัน<br>
      ก่อนติดตั้งต้องเปิด <strong>Install unknown apps</strong> ในการตั้งค่า
    </p>
  </div>

  <script>
    new QRCode(document.getElementById("qrcode"), {{
      text: "{apk_url}",
      width: 180, height: 180,
      colorDark: "#085041",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    }});
  </script>
</body>
</html>
"""

(SERVE / "index.html").write_text(html, encoding="utf-8")

# ── Start server ──────────────────────────────────────────────────────────────
os.chdir(SERVE)

print(f"""
  SLEEPMARK APK Server
  ----------------------------------------
  PC      : http://localhost:{PORT}
  Mobile  : {base_url}
  ----------------------------------------
  Press Ctrl+C to stop
""")

handler = http.server.SimpleHTTPRequestHandler
handler.log_message = lambda *a: None   # ปิด access log รก

with socketserver.TCPServer(("", PORT), handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server หยุดแล้ว\n")
