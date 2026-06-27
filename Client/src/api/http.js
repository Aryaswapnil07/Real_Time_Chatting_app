const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const ACCESS_TOKEN_KEY = "quickchat_access_token";
const REFRESH_TOKEN_KEY = "quickchat_refresh_token";

export const tokenStore = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(accessToken, refreshToken) {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }

    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export class ApiRequestError extends Error {
  constructor(message, statusCode, payload) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.payload = payload;
  }
}

const buildUrl = (path) => `${API_BASE_URL}${path}`;

let refreshPromise = null;

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
};

const refreshAccessToken = async () => {
  const refreshToken = tokenStore.getRefreshToken();

  if (!refreshToken) {
    throw new ApiRequestError("Session expired", 401, null);
  }

  const response = await fetch(buildUrl("/users/refresh-token"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const payload = await parseResponse(response);

  if (!response.ok || payload?.success === false) {
    throw new ApiRequestError(
      payload?.message || "Session expired",
      response.status,
      payload,
    );
  }

  tokenStore.setTokens(payload.data?.accessToken, payload.data?.refreshToken);
  return payload.data;
};

const getFreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken()
      .catch((error) => {
        tokenStore.clear();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const createFetchOptions = ({ method, body, headers, auth }) => {
  const options = {
    method,
    credentials: "include",
    headers: {
      ...headers,
    },
  };

  const token = tokenStore.getAccessToken();

  if (auth && token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (body instanceof FormData) {
    options.body = body;
  } else if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  return options;
};

export const request = async (
  path,
  { method = "GET", body, headers = {}, auth = true } = {},
) => {
  const fetchOptions = createFetchOptions({ method, body, headers, auth });
  let response = await fetch(buildUrl(path), fetchOptions);

  if (response.status === 401 && auth && tokenStore.getRefreshToken()) {
    await getFreshAccessToken();
    response = await fetch(
      buildUrl(path),
      createFetchOptions({ method, body, headers, auth }),
    );
  }

  const payload = await parseResponse(response);

  if (!response.ok || payload?.success === false) {
    if (response.status === 401 && auth) {
      tokenStore.clear();
    }

    throw new ApiRequestError(
      payload?.message || "Something went wrong",
      response.status,
      payload,
    );
  }

  return payload?.data ?? payload;
};
