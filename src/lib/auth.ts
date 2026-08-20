export function getCurrentUser() {
  const userJson = localStorage.getItem("user");
  return userJson ? JSON.parse(userJson) : null;
}

export function hasRole(...roles: string[]) {
  const user = getCurrentUser();
  return user ? roles.includes(user.role) : false;
}