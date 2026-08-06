window.config = {
  siteName: 'Subconverter Web',
  apiBackends: [
    {
      name: '官方公共服务（订阅内容会发送至此）',
      url: 'https://sub.xeton.dev',
    },
  ],
  enableShortUrl: false,
  shortUrl: '',
  menuItem: [
    { title: '首页', link: '/', target: '' },
    {
      title: 'GitHub',
      link: 'https://github.com/Aethersailor/subweb',
      target: '_blank',
    },
  ],
  remoteConfigOptions: [
    {
      value: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online.ini',
      text: 'ACL4SSR Online',
    },
    {
      value: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full.ini',
      text: 'ACL4SSR Online Full',
    },
  ],
};
