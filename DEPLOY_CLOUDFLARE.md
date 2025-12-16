# Cloudflare Pages 部署指南

本项目原生支持部署到 Cloudflare Pages，并支持通过环境变量动态修改配置（替代 Docker 的 `start.sh`）。

## 部署步骤

1.  **Fork 本项目**到你的 GitHub 账号。
2.  登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，进入 **Pages** 页面。
3.  点击 **Create a project** -> **Connect to Git**。
4.  选择你 Fork 的 `subweb` 仓库。
5.  在 **Build settings** 中：
    *   **Framework preset**: 选择 `Vue.js`
    *   **Build command**: `npm run build`
    *   **Build output directory**: `dist`
6.  点击 **Save and Deploy**。

## 环境变量配置

在 Cloudflare Pages 项目的 **Settings** -> **Environment variables** 中，你可以添加以下变量来覆盖默认配置（与 Docker 环境变量保持一致）：

| 变量名 | 描述 | 默认值 |
| :--- | :--- | :--- |
| `SITE_NAME` | 网站标题 | `Subconverter Web` |
| `API_URL` | 本地后端 API 地址 | `http://127.0.0.1:25500` |
| `SHORT_URL` | 短链接服务地址 | `https://s.ops.ci` |

### 进阶配置 (JSON)

如果需要配置多个后端或自定义远程配置列表，可以使用 **JSON 格式**的字符串。

| 变量名 | 描述 | 示例值 (JSON String) |
| :--- | :--- | :--- |
| `API_BACKENDS` | 自定义后端列表 (覆盖 `API_URL`) | `[{"name":"我的服务","url":"https://api.example.com"},{"name":"备用","url":"https://bak.example.com"}]` |
| `API_BACKENDS` | 自定义后端列表 (覆盖 `API_URL`) | `[{"name":"我的服务","url":"https://api.example.com"},{"name":"备用","url":"https://bak.example.com"}]` |
| `REMOTE_CONFIG` | 自定义远程配置列表 | `[{"text":"ACL4SSR","value":"https://..."},{"text":"自用","value":"https://..."}]` |
| `MENU_ITEM` | 自定义顶部菜单 | `[{"title":"TG群","link":"https://t.me/...","target":"_blank"}]` |

配置完成后，请触发一次 **Retry deployment** 以生效。

## 原理说明

项目包含 `functions/conf/config.js.js` 文件。这是一个 Cloudflare Pages Function，它会拦截对 `/conf/config.js` 的请求，并根据环境变量动态生成 JavaScript 配置代码返回给浏览器。
