<div align="center">
  <h1>✨ SubWeb</h1>
  <p><strong>优雅的 Subconverter 订阅转换前端</strong></p>

[![GitHub stars](https://img.shields.io/github/stars/Aethersailor/subweb?style=flat-square&logo=github)](https://github.com/Aethersailor/subweb/stargazers)
[![Docker Pulls](https://img.shields.io/docker/pulls/aethersailor/subweb?style=flat-square&logo=docker)](https://hub.docker.com/r/aethersailor/subweb)
[![License](https://img.shields.io/github/license/Aethersailor/subweb?style=flat-square)](LICENSE)

  <p>
    <a href="https://sub.asailor.org">🌐 在线演示</a> •
    <a href="#-快速开始">🚀 快速开始</a> •
    <a href="#-部署方式">📦 部署方式</a> •
    <a href="DEPLOY_CLOUDFLARE.md">☁️ Cloudflare Pages 部署</a>
  </p>
</div>

---

## 📖 项目简介

SubWeb 是一个轻量的 **Vue 3** [subconverter](https://github.com/tindy2013/subconverter) 前端，帮助用户生成 Clash、Surge、Quantumult X 等客户端的订阅链接。

> 本项目 Fork 自 [stilleshan/subweb](https://github.com/stilleshan/subweb)，在原版基础上修复了一些 BUG 并进行了功能增强。

### ✨ 特性亮点

- 🎨 **现代化界面** — 原生 Vue 3 响应式界面，支持键盘操作与深色模式
- ☁️ **Cloudflare 原生支持** — 新增 Cloudflare Pages/Workers 部署方案，无需服务器
- 🔗 **隐私可控的短链接** — 默认关闭；启用后会明确提示数据接收方并要求用户确认
- 🐳 **Docker 一键部署** — 支持 x86 与 ARM 架构，快速上线
- ⚙️ **高度可配置** — 支持自定义后端 API、远程配置、站点名称等

---

## 🧩 相关项目

| 项目                                                                                          | 说明                                       |
| :-------------------------------------------------------------------------------------------- | :----------------------------------------- |
| [Aethersailor/subweb](https://github.com/Aethersailor/subweb)                                 | 📌 本项目 — 订阅转换前端                   |
| [Aethersailor/SubConverter-Extended](https://github.com/Aethersailor/SubConverter-Extended)   | 🔗 配套改进型后端服务，支持更多功能        |
| [Aethersailor/cf-shortlink-worker](https://github.com/Aethersailor/cf-shortlink-worker)       | 🔗 配套短链接服务，Cloudflare Workers 部署 |
| [Aethersailor/Custom_OpenClash_Rules](https://github.com/Aethersailor/Custom_OpenClash_Rules) | 📜 自定义 OpenClash 分流规则               |

---

## 🚀 快速开始

### 在线体验

访问演示站点，立即体验订阅转换功能：

**👉 [https://sub.asailor.org](https://sub.asailor.org)**

---

## 📦 部署方式

### 方式一：Cloudflare Pages（推荐）

> 全套服务均可部署于 Cloudflare 云端，无需服务器或 VPS

**详细教程请参阅 → [DEPLOY_CLOUDFLARE.md](DEPLOY_CLOUDFLARE.md)**

简要步骤：

1. Fork 本项目到你的 GitHub 账号
2. 在 Cloudflare Pages 中连接你的仓库
3. 设置构建命令为 `npm run build`，输出目录为 `dist`
4. 通过环境变量自定义配置（可选）

---

### 方式二：Docker 部署

#### 🟢 本地快速部署

```bash
docker run -d --name subweb --restart always \
  -p 18080:80 \
  aethersailor/subweb:latest
```

访问：`http://127.0.0.1:18080`

#### 🔧 自定义配置部署

挂载配置目录，实现自定义站点名称、后端 API、短链接服务等：

```bash
docker run -d --name subweb --restart always \
  -p 18080:80 \
  -v /your/path/conf:/usr/share/nginx/html/conf \
  -e API_URL='https://api.example.com' \
  -e SITE_NAME='我的订阅转换' \
  aethersailor/subweb:latest
```

未传入环境变量时，启动脚本只会在挂载目录缺少 `config.js` 时写入默认配置；已有配置不会被覆盖。传入 `API_URL`、`SITE_NAME`、`SHORT_URL` 或 `ENABLE_SHORT_URL` 时，会在每次启动时原子地重新生成配置，环境变量修改可稳定生效。

镜像同时发布 `linux/amd64` 与 `linux/arm64`。镜像只负责提供静态前端，不会在运行服务器上编译；构建由 GitHub Actions 完成。

> 💡 **推荐**：使用 Nginx 反向代理并配置 HTTPS

---

## ⚙️ 配置说明

`config.js` 配置文件示例：

```javascript
window.config = {
  // 网站标题
  siteName: 'Subconverter Web',

  // 后端 API 列表
  apiBackends: [
    {
      name: 'Aethersailor 后端',
      url: 'https://api.asailor.org',
    },
    {
      name: '肥羊增强型后端',
      url: 'https://api.v1.mk',
    },
  ],

  // 短链接功能开关
  // 默认关闭；开启会把完整转换链接发送到短链接服务
  enableShortUrl: false,

  // 短链接服务地址
  shortUrl: '',

  // 首页菜单
  menuItem: [
    {
      title: '通知频道',
      link: 'https://t.me/custom_openclash_rules',
      target: '_blank',
    },
    {
      title: '聊天群组',
      link: 'https://t.me/custom_openclash_rules_group',
      target: '_blank',
    },
    {
      title: 'Custom_OpenClash_Rules',
      link: 'https://github.com/Aethersailor/Custom_OpenClash_Rules',
      target: '_blank',
    },
  ],

  // 远程配置列表
  remoteConfigOptions: [
    {
      value:
        'https://raw.githubusercontent.com/Aethersailor/Custom_OpenClash_Rules/refs/heads/main/cfg/Custom_Clash.ini',
      text: 'Aethersailor 规则 标准版',
    },
    {
      value:
        'https://raw.githubusercontent.com/Aethersailor/Custom_OpenClash_Rules/refs/heads/main/cfg/Custom_Clash_Lite.ini',
      text: 'Aethersailor 规则 轻量版',
    },
    {
      value:
        'https://raw.githubusercontent.com/Aethersailor/Custom_OpenClash_Rules/refs/heads/main/cfg/Custom_Clash_GFW.ini',
      text: 'Aethersailor 规则 极简版(GFW)',
    },
    {
      value:
        'https://raw.githubusercontent.com/Aethersailor/Custom_OpenClash_Rules/refs/heads/main/cfg/Custom_Clash_Full.ini',
      text: 'Aethersailor 规则 重度分流版',
    },
  ],
};
```

---

## 🔗 致谢

本项目基于以下优秀项目进行开发：

- [stilleshan/subweb](https://github.com/stilleshan/subweb) — 原始项目

---

## 📄 开源协议

本项目基于 [GPL-3.0](LICENSE) 协议开源。

---

<div align="center">
  <sub>Made with ❤️ by <a href="https://github.com/Aethersailor">Aethersailor</a></sub>
</div>
