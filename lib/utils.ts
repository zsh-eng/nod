export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '');
}

export function formatStatusText(status: string) {
  switch (status) {
    case 'completed':
      return 'completed';
    case 'in_progress':
      return 'downloading';
    case 'not_started':
      return 'not started';
    case 'paused':
      return 'paused';
    default:
      return status;
  }
}
