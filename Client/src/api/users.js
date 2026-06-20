import { request } from "./http";

export const usersApi = {
  register(formData) {
    return request("/users/register", {
      method: "POST",
      body: formData,
      auth: false,
    });
  },
  login(credentials) {
    return request("/users/login", {
      method: "POST",
      body: credentials,
      auth: false,
    });
  },
  logout() {
    return request("/users/logout", {
      method: "POST",
    });
  },
  getCurrentUser() {
    return request("/users/current-user");
  },
  updateAccount(details) {
    return request("/users/update-account", {
      method: "PATCH",
      body: details,
    });
  },
  updateAvatar(formData) {
    return request("/users/update-avatar", {
      method: "PATCH",
      body: formData,
    });
  },
  search(query) {
    return request(`/users/search?query=${encodeURIComponent(query)}`);
  },
  getProfile(userId) {
    return request(`/users/profile/${userId}`);
  },
};
