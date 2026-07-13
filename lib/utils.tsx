export const slugify = (text: string) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/\//g, '-')
    .replace(/&/g, '')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
};