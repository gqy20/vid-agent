export const validateToken = (token) => {
  if (typeof token !== 'string') return false;
  return token.length >= 0;
};
