# subweb

Fork from [stilleshan/subweb](https://github.com/stilleshan/subweb)  

在原版基础上修复一些 BUG 并做了一些修改，增加了 Cloudflare Worker 部署方法  

增加配套短域名工具：[Aethersailor/cf-shortlink-worker](https://github.com/Aethersailor/cf-shortlink-worker)，可使用 Cloudflare Pages 部署  

全套服务均可部署于 Cloudflare 云端，无需服务器或 VPS  

## 简介
subweb 是基于 subconverter 订阅转换的前端项目,方便用户快速生成各平台的订阅链接.

> *subweb 是我个人入门 vuejs 学习时简单做的一个案例,使用还算方便,开源出来,欢迎各路大佬贡献维护.*

*GitHub [stilleshan/subweb](https://github.com/Aethersailor/subweb)  
Docker [stilleshan/subweb](https://hub.docker.com/r/Aethersailor/subweb)*
> *docker image support for X86 and ARM*

## 示例
[https://sub.asailor.org](https://sub.asailor.org)  
*`前后端示例,可以直接使用.`*

## 部署
### docker 本地版
*适用于本机快速部署使用*
```shell
docker run -d --name subweb --restart always \
  -p 18080:80 \
  aethersailor/subweb
```

访问 `http://127.0.0.1:18080`

### docker 自定义版 + 短链接版
自定义版可以挂载配置文件来修改`API 地址`,`短链接地址`,`站点名称`,`导航链接`.  
参考以下命令,修改本地挂载路径,启动容器后会生成`config.js`配置文件,更改后刷新生效.

```shell
docker run -d --name subweb --restart always \
  -p 18080:80 \
  -v /PATH/subweb/public/conf:/usr/share/nginx/html/conf \
  aethersailor/subweb
```

访问 `http://127.0.0.1:18080`  
> *推荐使用 nginx 反向代理部署*

示例配置：  
```
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
  // 短域名服务地址
  shortUrl: 'https://s.asailor.org',
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
  // 远程配置地址,可以自行按照格式添加。
  remoteConfigOptions: [
    {
      value: 'https://raw.githubusercontent.com/Aethersailor/Custom_OpenClash_Rules/refs/heads/main/cfg/Custom_Clash.ini',
      text: 'Aethersailor 规则 标准版',
    },
    {
      value: 'https://raw.githubusercontent.com/Aethersailor/Custom_OpenClash_Rules/refs/heads/main/cfg/Custom_Clash_Lite.ini',
      text: 'Aethersailor 规则 轻量版',
    },
    {
      value: 'https://raw.githubusercontent.com/Aethersailor/Custom_OpenClash_Rules/refs/heads/main/cfg/Custom_Clash_GFW.ini',
      text: 'Aethersailor 规则 极简版(GFW)',
    },
    {
      value: 'https://raw.githubusercontent.com/Aethersailor/Custom_OpenClash_Rules/refs/heads/main/cfg/Custom_Clash_Full.ini',
      text: 'Aethersailor 规则 重度分流版',
    },
  ],
};
```  

## 链接
- [stilleshan/sub](https://github.com/stilleshan/dockerfiles/tree/main/sub)
- [stilleshan/subweb](https://github.com/stilleshan/subweb)
- [stilleshan/subconverter](https://github.com/stilleshan/subconverter)
