export default function showNotification(message = '', title = '成功', type = title === '成功' ? 'success' : 'error') {
  window.dispatchEvent(
    new CustomEvent('subweb:notification', {
      detail: {
        message: String(message),
        title: String(title),
        type: type === 'success' ? 'success' : 'error',
      },
    }),
  );
}
