import DOMPurify from 'dompurify'

export const sanitizeEmailHtml = (html: string | null | undefined): string => {
  if (!html) return ''

  // Configure DOMPurify hook to ensure all external links open securely in new tab
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if ('target' in node) {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })

  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 
      'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 
      'blockquote', 'table', 'tbody', 'thead', 'tr', 'td', 'th', 'hr', 'pre', 'code'
    ],
    ALLOWED_ATTR: ['href', 'class', 'style', 'title', 'target', 'rel'],
    FORBID_SCRIPTS: true,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
  })

  // Clean hook afterwards
  DOMPurify.removeHook('afterSanitizeAttributes')

  return sanitized
}
