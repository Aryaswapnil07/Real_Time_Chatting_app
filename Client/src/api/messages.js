import { request } from "./http";

export const messagesApi = {
  send(payload) {
    return request("/messages", {
      method: "POST",
      body: payload,
    });
  },
  getByConversation(conversationId) {
    return request(`/messages/${conversationId}`);
  },
  markSeen(messageId) {
    return request(`/messages/seen/${messageId}`, {
      method: "PATCH",
    });
  },
  delete(messageId) {
    return request(`/messages/${messageId}`, {
      method: "DELETE",
    });
  },
};
