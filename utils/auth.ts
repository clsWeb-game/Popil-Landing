const isBrowser = typeof window !== "undefined";

export const saveAuth = (user: any, token: string) => {
  if (!isBrowser) return;

  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);

  document.cookie = `token=${token}; path=/; max-age=${
    7 * 24 * 60 * 60
  }; SameSite=Lax`;
  document.cookie = `user=${encodeURIComponent(
    JSON.stringify(user)
  )}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
};

export const getAuth = () => {
  if (!isBrowser) {
    return {
      user: null,
      token: null,
    };
  }

  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  return {
    user: user ? JSON.parse(user) : null,
    token: token || null,
  };
};

export const clearAuth = () => {
  if (!isBrowser) return;

  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("checkInData");

  document.cookie = "token=; path=/; max-age=0";
  document.cookie = "user=; path=/; max-age=0";
};