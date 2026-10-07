async function signIn(path, credentials) {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const body = await response.json();

    if (!response.ok) {
      return { success: false, error: { name: "AuthError", message: body.message } };
    }

    localStorage.setItem("token", body.token);
    return { success: true, redirectTo: "/" };
  } catch {
    return { success: false, error: { name: "AuthError", message: "Could not reach the server" } };
  }
}

const authProvider = {
  login: ({ email, password }) => signIn("/api/login", { email, password }),

  register: ({ email, password }) => signIn("/api/register", { email, password }),

  logout: async () => {
    localStorage.removeItem("token");
    window.location.assign("/login");
    return { success: true };
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
