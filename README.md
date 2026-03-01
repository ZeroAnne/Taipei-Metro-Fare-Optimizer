# 北捷通勤精算師 · Metro Fare Pro

幫你計算每月搭台北捷運，**悠遊卡常客優惠**與 **TPASS 月票（$1,200）** 哪個比較划算的工具。

---

## 功能特色

- 選擇起站／終站，自動查詢 TDX 即時票價
- 設定每月通勤天數與每天搭乘次數
- 支援成人、學生、孩童、敬老、愛心五種票種
- 依常客優惠等級（0 / 5% / 10% / 15%）自動計算回饋
- 即時比較悠遊卡費用 vs TPASS，給出建議
- 票價資料快取於 `localStorage`，24 小時內不重複呼叫 API

---

## 技術架構

| 層級 | 技術 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| 圖示 | Lucide React |
| 語言 | TypeScript |
| 資料來源 | TDX 運輸資料流通服務 API |

### 專案結構

```
src/
├── app/
│   ├── page.tsx          # 主頁面，串接所有元件與狀態
│   ├── layout.tsx        # Root Layout
│   └── globals.css       # 全域樣式（Tailwind + 玻璃擬態）
├── components/
│   ├── StationSelect.tsx  # 捷運站下拉選單
│   ├── DaysSlider.tsx     # 通勤天數滑桿
│   ├── TripSelector.tsx   # 每日搭乘次數選擇器
│   ├── FareClassSelector.tsx # 票種選擇（成人/學生...）
│   ├── ResultCard.tsx     # 費用結果卡片
│   └── DiscountTable.tsx  # 常客優惠等級對照表
├── hooks/
│   └── useCountUp.ts      # 數字滾動動畫 Hook
└── lib/
    ├── types.ts           # TypeScript 型別定義
    ├── calc.ts            # 核心票價計算邏輯
    ├── tdx-api.ts         # TDX API 串接（取得票價 / 車站）
    ├── stations.ts        # 靜態車站清單備援資料
    └── lines.ts           # 路線定義
```

---

## 快速開始

### 1. 安裝套件

```bash
npm install
```

### 2. 設定 TDX API 憑證

前往 [TDX 平台](https://tdx.transportdata.tw/) 申請帳號，取得 **Client ID** 與 **Client Secret**：

```bash
cp .env.example .env.local
```

編輯 `.env.local`，填入實際值（此檔已被 `.gitignore` 排除，不會被提交）：

```env
NEXT_PUBLIC_TDX_CLIENT_ID=你的Client_ID
NEXT_PUBLIC_TDX_CLIENT_SECRET=你的Client_Secret
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

打開瀏覽器前往 [http://localhost:3000](http://localhost:3000)

---

## 常客優惠等級說明

| 當月搭乘次數 | 折扣 | 回饋比例 |
|:---:|:---:|:---:|
| 1 – 10 次 | 原價 | 0% |
| 11 – 20 次 | 95 折 | 5% |
| 21 – 40 次 | 9 折 | 10% |
| 41 次以上 | 85 折 | 15% |

> TPASS 定價為 **$1,200 / 月**，適用台北捷運無限次搭乘。

---

## 部署

建議使用 [Vercel](https://vercel.com/) 一鍵部署：

```bash
npm run build
```

或直接在 Vercel Dashboard 匯入此 GitHub 專案即可。部署時在 Vercel 專案設定裡加入環境變數 `NEXT_PUBLIC_TDX_CLIENT_ID`、`NEXT_PUBLIC_TDX_CLIENT_SECRET`。

---

## 資料來源

- 票價資料：[TDX 運輸資料流通服務](https://tdx.transportdata.tw/)（交通部）
- API Endpoint：`GET /v2/Rail/Metro/ODFare/TRTC`

> 本工具資料僅供參考，實際費用以台北捷運官方公告為準。
