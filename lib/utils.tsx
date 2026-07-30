// export const slugify = (text: string) => {
//   if (!text) return '';
//   return text
//     .toString()
//     .toLowerCase()
//     .trim()
//     .replace(/\s+/g, '-')
//     .replace(/\//g, '-')
//     .replace(/&/g, '')
//     .replace(/[^\w-]+/g, '')
//     .replace(/--+/g, '-')
// };
export const slugify = (text: string) => {
  if (!text) return '';
  return text
    .toString()
    .replace(/^[a-zA-Z0-9]+-\d+-/, '') 
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')    
    .replace(/\//g, '-')     
    .replace(/&/g, '')       
    .replace(/[^\w-]+/g, '') 
    .replace(/--+/g, '-')    
    .replace(/^-+|-+$/g, '');
};