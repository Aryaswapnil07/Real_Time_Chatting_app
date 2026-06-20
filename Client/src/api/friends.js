import { request } from "./http";

export const friendsApi = {
  sendRequest(receiverId) {
    return request(`/friends/send/${receiverId}`, {
      method: "POST",
    });
  },
  acceptRequest(requestId) {
    return request(`/friends/accept/${requestId}`, {
      method: "PATCH",
    });
  },
  rejectRequest(requestId) {
    return request(`/friends/reject/${requestId}`, {
      method: "PATCH",
    });
  },
  cancelRequest(requestId) {
    return request(`/friends/cancel/${requestId}`, {
      method: "DELETE",
    });
  },
  getPendingRequests() {
    return request("/friends/pending");
  },
  getSentRequests() {
    return request("/friends/sent");
  },
  getFriends() {
    return request("/friends/list");
  },
  removeFriend(friendId) {
    return request(`/friends/remove/${friendId}`, {
      method: "DELETE",
    });
  },
};
