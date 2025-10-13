import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY_USERS = "exteriorUsers";
const STORAGE_KEY_USER = "exteriorUser";

const DEFAULT_USERS = [
  {
    email: "admin@ngoai-that.ai",
    password: "admin123",
    role: "admin",
    name: "Quản trị viên",
  },
  {
    email: "designer@ngoai-that.ai",
    password: "design123",
    role: "designer",
    name: "Nhà thiết kế",
  },
];

const AuthContext = createContext(null);

const normalizeUsers = (rawUsers) => {
  if (!Array.isArray(rawUsers)) return DEFAULT_USERS;
  const merged = new Map(
    DEFAULT_USERS.map((user) => [user.email.toLowerCase(), user])
  );

  rawUsers.forEach((user) => {
    if (user?.email) {
      merged.set(user.email.toLowerCase(), {
        ...user,
        email: user.email.toLowerCase(),
      });
    }
  });

  return Array.from(merged.values());
};

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_USERS;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_USERS);
      if (!stored) return DEFAULT_USERS;
      return normalizeUsers(JSON.parse(stored));
    } catch (error) {
      console.warn("Không thể đọc danh sách người dùng:", error);
      return DEFAULT_USERS;
    }
  });

  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_USER);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
      console.warn("Không thể đọc thông tin đăng nhập:", error);
      return null;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      window.localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user]);

  const login = ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const matchedUser = users.find(
      (candidate) =>
        candidate.email === normalizedEmail && candidate.password === password
    );

    if (!matchedUser) {
      return {
        ok: false,
        message: "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.",
      };
    }

    setUser({
      email: matchedUser.email,
      role: matchedUser.role,
      name: matchedUser.name,
    });

    return { ok: true };
  };

  const register = ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const exists = users.some((item) => item.email === normalizedEmail);

    if (exists) {
      return { ok: false, message: "Email này đã tồn tại trong hệ thống." };
    }

    const newUser = {
      email: normalizedEmail,
      password,
      role: "designer",
      name: name.trim(),
    };

    setUsers((prev) => [...prev, newUser]);

    return { ok: true, email: normalizedEmail };
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      users,
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
    }),
    [user, users]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }
  return context;
}
