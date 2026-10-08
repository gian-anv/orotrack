const authProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json();
      if (!response.ok) {
        return { success: false, error: { name: "LoginError", message: body.message } };
      }
      localStorage.setItem("token", body.token);
      return { success: true, redirectTo: "/" };
    } catch {
      return { success: false, error: { name: "LoginError", message: "Could not reach the server" } };
    }
  },

  logout: async () => {
    localStorage.removeItem("token");
    window.location.assign("/login");
    return { success: true };
  },

  check: async () => {
    if (localStorage.getItem("token")) {
      return { authenticated: true };
    }
    return { authenticated: false, redirectTo: "/login" };
  },

  onError: async (error) => {
    if (error.statusCode === 401) {
      return { logout: true, redirectTo: "/login" };
    }
    return {};
  },

  getPermissions: async () => {
    const response = await fetch("/api/me", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!response.ok) return null;
    const me = await response.json();
    return me.role;
  },
};

export default authProvider;
