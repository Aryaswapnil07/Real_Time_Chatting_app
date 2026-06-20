import { request } from "./http";

export const notificationsApi = {
  getAll() {
    return request("/notifications");
  },
  getUnreadCount() {
    return request("/notifications/unread-count");
  },
  markRead(notificationId) {
    return request(`/notifications/read/${notificationId}`, {
      method: "PATCH",
    });
  },
  markAllRead() {
    return request("/notifications/read-all", {
      method: "PATCH",
    });
  },
  delete(notificationId) {
    return request(`/notifications/${notificationId}`, {
      method: "DELETE",
    });
  },
};
