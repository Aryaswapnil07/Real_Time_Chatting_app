import { request } from "./http";

export const conversationsApi = {
  create(participantId) {
    return request("/conversations", {
      method: "POST",
      body: { participantId },
    });
  },
  getMine() {
    return request("/conversations");
  },
  getById(conversationId) {
    return request(`/conversations/${conversationId}`);
  },
};
