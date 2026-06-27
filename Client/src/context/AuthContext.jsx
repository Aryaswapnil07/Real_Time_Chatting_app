import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usersApi } from "../api/users";
import { tokenStore } from "../api/http";
import { connectSocket, disconnectSocket } from "../socket/socket.js";
import { AuthContext } from "./authContextValue.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    if (!tokenStore.getAccessToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await usersApi.getCurrentUser();
      setUser(currentUser);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadCurrentUser();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadCurrentUser]);

  useEffect(() => {
    if (user?._id) {
      connectSocket(user._id);
      return () => {
        disconnectSocket();
      };
    }

    disconnectSocket();
    return undefined;
  }, [user?._id]);

  const login = useCallback(async (credentials) => {
    const data = await usersApi.login(credentials);
    tokenStore.setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback((formData) => usersApi.register(formData), []);

  const logout = useCallback(async () => {
    try {
      if (tokenStore.getAccessToken()) {
        await usersApi.logout();
      }
    } finally {
      disconnectSocket();
      tokenStore.clear();
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(
    async ({ fullName, email, bio, avatarFile }) => {
      if (!user?._id) {
        throw new Error("You must be logged in to update your profile.");
      }

      let updatedUser = user;

      if (fullName && email) {
        updatedUser = await usersApi.updateAccount({ fullName, email, bio });
        setUser(updatedUser);
      }

      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        updatedUser = await usersApi.updateAvatar(formData);
        setUser(updatedUser);
      }

      return updatedUser;
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateProfile,
      refreshUser: loadCurrentUser,
    }),
    [loadCurrentUser, loading, login, logout, register, updateProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
