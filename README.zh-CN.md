# 🌍 FateMap（命运地图）

[![MIT License](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com)

**输入任何事件，看世界如何反应。**

AI 驱动的地缘政治推演沙盘。

**[在线体验](https://toffee-desuwa-fatemap.hf.space)** | [English](./README.md)

![FateMap 演示](docs/demo.png)

---

## FateMap 是什么？

FateMap 是一个交互式沙盘，你输入一个「如果……会怎样？」的场景 —— 比如 *「如果霍尔木兹海峡被封锁？」* —— 然后看 AI 预测的全球影响以冲击波动画实时扩散到世界地图上。国家亮起颜色，城市闪烁脉冲，贸易路线发光，冲击波从震中向外扩展。

**28 个预设场景开箱即用，无需 API 密钥。** 自带 LLM 密钥（DeepSeek、Gemini、OpenAI、Anthropic）可解锁自定义场景。

## 功能特性

- **冲击波可视化** — 同心波纹从震中扩散，国家填色表示影响等级，城市标记脉冲闪烁，关系网络线条发光
- **28 个预设场景** — 军事、贸易、能源、气候、健康、政治、经济、科技 — 全部离线可用
- **自带密钥 (BYOK)** — 带上自己的 API 密钥，无限自定义推演（DeepSeek、Gemini、OpenAI、Anthropic）
- **双语支持** — 完整的中英文界面和场景数据
- **事件信息流** — 按分类浏览和筛选场景，关键词搜索
- **响应式设计** — 桌面三栏、平板两栏、手机全屏地图浮层

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 15 + React 19 + TypeScript |
| 地图 | deck.gl (WebGL) + MapLibre GL |
| 样式 | Tailwind CSS v4 |
| 国际化 | next-intl |
| AI | 浏览器端 BYOK（无服务端代理） |
| 校验 | Zod |

## 快速开始

```bash
# 克隆
git clone https://github.com/your-username/fatemap.git
cd fatemap

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)，点击「立即体验」进入推演面板。

### 可选：自带 LLM 密钥

进入 **设置** → 选择服务商 → 粘贴 API 密钥 → **测试** → **保存**。

自定义场景现在会使用你的 LLM。预设场景始终无需密钥。

## 架构

```
浏览器
├── 首页（自动轮播英雄地图）
├── 推演面板
│   ├── 事件信息流（左） — 28 个预设场景，8 个分类筛选，搜索
│   ├── FateMap（中） — deck.gl WebGL 地图，4 层可视化系统
│   │   ├── 国家填色（GeoJsonLayer） — 按影响等级着色的多边形
│   │   ├── 网络发光（PathLayer ×3） — 关系线三层辉光叠加
│   │   ├── 城市标记（ScatterplotLayer ×2） — 脉冲光晕 + 圆点
│   │   └── 冲击波环（ScatterplotLayer ×4） — 扩展涟漪
│   └── 影响报告（右） — 国家/城市影响排名
└── 设置 — BYOK API 密钥配置

推演流程：
  用户输入 → 关键词分析器（预设匹配）
           → LLM 分析器（BYOK 降级）
           → Zod 校验
           → 动画阶段：空闲 → 涟漪 (2s) → 网络 (3s) → 持续
```

## 数据规模

| 类型 | 数量 |
|------|------|
| 国家 | 48 |
| 城市 | 84 |
| 关系 | 142 |
| 预设场景 | 28 |

## 命令

```bash
npm run dev      # 开发服务器
npm run build    # 生产构建
npm run lint     # ESLint 检查
npm test         # Jest 测试（472+ 条）
```

## 项目结构

```
fatemap/
├── src/
│   ├── app/              # Next.js 应用路由
│   │   └── [locale]/     # 国际化路由（en, zh）
│   ├── components/
│   │   ├── layout/       # AppShell, Header, LocaleSwitcher
│   │   ├── map/          # FateMap, FateHeroMap
│   │   ├── simulation/   # ScenarioInput, ImpactReport
│   │   ├── feed/         # EventFeed, EventCard
│   │   ├── settings/     # ApiKeySettings
│   │   └── charts/       # AnimatedNumber
│   ├── hooks/            # useSimulation
│   └── lib/              # 数据、分析器、可视化层
├── messages/             # en.json, zh.json
└── public/geo/           # GeoJSON 数据
```

## 许可证

MIT
