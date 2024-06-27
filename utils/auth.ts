export const getUserInfo = () => {
  const userInfo = localStorage.getItem('user');
  return userInfo ? JSON.parse(userInfo) : null;
};
