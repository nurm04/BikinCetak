export const slugify = (text: string) => {
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