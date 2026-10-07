const API_URL = "/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await response.json();
  if (!response.ok) {
    throw { message: body.message, statusCode: response.status };
  }
  return body;
}

const dataProvider = {
  getList: async ({ resource }) => {
    const rows = await request(`/${resource}`);
    return { data: rows, total: rows.length };
  },
  getOne: async ({ resource, id }) => {
    const row = await request(`/${resource}/${id}`);
    return { data: row };
  },
  create: async ({ resource, variables }) => {
    const row = await request(`/${resource}`, { method: "POST", body: JSON.stringify(variables) });
    return { data: row };
  },
  update: async ({ resource, id, variables }) => {
    const row = await request(`/${resource}/${id}`, { method: "PUT", body: JSON.stringify(variables) });
    return { data: row };
  },
  deleteOne: async ({ resource, id }) => {
    const row = await request(`/${resource}/${id}`, { method: "DELETE" });
    return { data: row };
  },
  getApiUrl: () => API_URL,
};

export default dataProvider;
