const authProvider = {
  login: async ({ email, password }) => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: { name: "LoginError", message: "Wrong email or password" },
      };
    }

    const { token } = await response.json();
    localStorage.setItem("token", token);
    return { success: true, redirectTo: "/" };
  },

  logout: async () => {
    localStorage.removeItem("token");
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const token = localStorage.getItem("token");
    if (token) {
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
};

export default authProvider;
