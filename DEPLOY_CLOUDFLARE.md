# Cloudflare Pages 部署指南

SubWeb 以 Cloudflare Pages 为主要部署平台。Pages 提供静态前端和运行时配置接口；订阅转换仍由浏览器直接请求所选的 SubConverter 或 SubConverter-Extended 后端。

## 部署边界

- Cloudflare Pages 托管 Vue 静态资源。
- Pages Function 只处理 `/conf/config.js`，用于读取环境变量并生成站点配置。
- Pages Function 不代理订阅转换，不接收订阅地址或节点。
- 短链接功能会把完整转换链接发送到单独配置的短链接服务，默认关闭。
- Docker 部署仍受支持，但不是本指南的主要部署方式。

因此，部署 SubWeb 之前仍需准备可公开访问的转换后端。SubConverter-Extended 和传统后端可以同时配置。

## 连接 Git 仓库

1. Fork [Aethersailor/subweb](https://github.com/Aethersailor/subweb)。
2. 在 Cloudflare Dashboard 中进入 **Workers & Pages**。
3. 创建 Pages 项目并选择 **Connect to Git**。
4. 选择 Fork 后的仓库。
5. 将生产分支设置为 `main`。

Pages 构建设置如下：

| 配置项                 | 值              |
| ---------------------- | --------------- |
| Framework preset       | `Vue.js`        |
| Build command          | `npm run build` |
| Build output directory | `dist`          |

仓库根目录的 `.node-version` 固定 Pages 使用的 Node.js 主版本。不要在 Dashboard 中配置不同的 `NODE_VERSION`。

## 配置生产环境

在 Pages 项目的 **Settings** → **Environment variables** 中配置生产环境变量。

### 基础变量

| 变量               | 用途           | 默认值                  |
| ------------------ | -------------- | ----------------------- |
| `SITE_NAME`        | 站点名称       | `Subconverter Web`      |
| `API_URL`          | 单个后端地址   | `https://sub.xeton.dev` |
| `ENABLE_SHORT_URL` | 是否启用短链接 | `false`                 |
| `SHORT_URL`        | 短链接服务地址 | 空                      |

Pages 通过 HTTPS 提供页面，因此 `API_URL`、`API_BACKENDS` 中的后端地址和 `SHORT_URL` 必须使用 HTTPS。HTTP 地址会被运行时配置校验忽略。

### 多后端配置

`API_BACKENDS` 使用 JSON 数组，并优先于 `API_URL`：

```json
[
  {
    "name": "SubConverter-Extended 增强型后端",
    "url": "https://api.example.com",
    "type": "subconverter-extended"
  },
  {
    "name": "subconverter 传统型后端",
    "url": "https://legacy-api.example.com",
    "type": "legacy"
  }
]
```

`type` 支持以下值：

| 值                      | 行为                                                                      |
| ----------------------- | ------------------------------------------------------------------------- |
| `auto`                  | 根据 `/version` 自动判断；省略 `type` 时使用此值                          |
| `subconverter-extended` | 探测失败时使用内置 SubConverter-Extended 能力；探测结果冲突时暂停专用能力 |
| `legacy`                | 使用传统后端界面和参数                                                    |

公开部署已知后端时，建议显式配置 `subconverter-extended` 或 `legacy`。用户手工输入的后端使用自动判断。

### 远程配置和菜单

`REMOTE_CONFIG` 和 `MENU_ITEM` 同样使用 JSON 数组：

```json
[
  {
    "text": "ACL4SSR Online",
    "value": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online.ini"
  }
]
```

```json
[
  {
    "title": "GitHub",
    "link": "https://github.com/Aethersailor/subweb",
    "target": "_blank"
  }
]
```

修改环境变量后，创建新部署或重新部署当前提交。现有部署不会自动读取修改后的变量。

## 配置预览环境

Pages 可以为同仓库分支和 Pull Request 创建独立预览部署。预览环境应单独配置：

- 使用测试后端，不使用生产订阅进行验收。
- 在 `SITE_NAME` 中标明「Preview」或「测试」。
- 默认关闭短链接。
- 保持 `API_BACKENDS.type` 与实际测试后端一致。

合并前至少验证：

1. `/version.json` 中的 `revision` 等于预览部署提交。
2. `/conf/config.js` 返回预期的后端和 `type`。
3. SubConverter-Extended 与传统后端切换后，目标客户端列表正确变化。
4. SubConverter-Extended 专用参数不会进入传统后端链接。
5. 浏览器控制台没有新的脚本、CSP 或运行时错误。

## 自定义域名

在 Pages 项目的 **Custom domains** 中添加自定义域名，并按 Cloudflare 提示完成 DNS 验证。域名激活前，不要把该地址写入正式文档或外部配置。

## 运行原理

浏览器按以下顺序加载运行时配置：

1. 请求 `/conf/config.js`。
2. Pages Function 读取并校验环境变量。
3. Function 以 `Cache-Control: no-store, max-age=0` 返回 `window.config`。
4. 如果 Function 不可用，浏览器请求 `/conf/config_static.js`。
5. 如果两个配置都不可用，前端进入安全手动模式。

`public/_routes.json` 只让 `/conf/config.js` 调用 Pages Function。其他页面和指纹资源由 Pages 直接提供。

## 隐私和安全

- 转换链接可能包含订阅凭据。不要把链接、诊断 JSON 或浏览器日志公开粘贴到 Issue。
- SubConverter-Extended 诊断会立即把当前来源发送到所选后端，因此前端会在请求前确认。
- Base64 是编码，不是加密。
- `provider_headers` 只填写 Header 名称。SubWeb 不收集或保存 Header 值。
- 短链接服务会收到完整转换链接。只在信任该服务时启用。
- 不要为绕过 CORS 而使用 Pages Function 代理任意后端。

## 回滚

生产部署异常时：

1. 在 Pages 项目的 **Deployments** 中选择上一个成功的生产部署。
2. 执行 **Rollback to this deployment**。
3. 验证 `/version.json` 已恢复到预期提交。
4. 验证 `/conf/config.js`、SubConverter-Extended 模式和传统模式。

预览部署不能作为生产回滚目标。回滚完成前，不要删除出现问题的部署和构建日志。

## 本地验证

```bash
npm ci
npm run check
```

`npm run check` 会执行格式检查、ESLint、Node.js 测试、Vite 构建和 Pages Functions 打包。
