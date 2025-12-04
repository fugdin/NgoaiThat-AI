// frontend/src/components/AdminDashboardPage.jsx
import { useEffect, useState, useCallback } from "react";
import AdminDashboard from "./AdminDashboard";
import {
  fetchAdminGenerations,
  fetchGenerationsByUser,
  deleteAdminGeneration,
} from "../api/admin";

const STATUS_CYCLE = ["pending", "in_progress", "approved", "revision"];
const PAGE_SIZE = 5;
const AUTH_ERROR_MESSAGE = "Token không hợp lệ, vui lòng đăng nhập lại.";

const buildFakeStatus = (id, index) => {
  const seed = Number(id) || 0;
  const pos = (seed + index) % STATUS_CYCLE.length;
  return STATUS_CYCLE[pos];
};

function normalizeGenerations(items = []) {
  return items.map((item, index) => ({
    id: item.Id,
    style: item.Style || "Ngoại thất hiện đại",
    createdByName: item.Email || "Ẩn danh",
    createdAt: item.CreatedAt,
    aiSuggestions: item.InputDesc || item.Description || "",
    status: buildFakeStatus(item.Id, index),
  }));
}

function normalizeUserStats(items = []) {
  return items.map((item) => ({
    id: item.UserId || item.Id,
    email: item.Email,
    role: item.Role,
    generationCount: item.GenerationCount || 0,
    lastGenerationAt: item.LastGenerationAt,
  }));
}

function AdminDashboardPage({ token }) {
  const [history, setHistory] = useState([]);
  const [accountStats, setAccountStats] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [historyMeta, setHistoryMeta] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
  });
  const [userMeta, setUserMeta] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserGenerations, setSelectedUserGenerations] = useState([]);
  const [selectedUserMeta, setSelectedUserMeta] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
  });
  const [loading, setLoading] = useState({ history: true, users: true });
  const [errors, setErrors] = useState({
    history: "",
    users: "",
    selectedUser: "",
  });

  const unwrap = useCallback((res) => res?.data ?? res ?? {}, []);

  const loadRecentGenerations = useCallback(
    async (pageToLoad = historyPage) => {
      setLoading((prev) => ({ ...prev, history: true }));
      try {
        const result = await fetchAdminGenerations(
          {
            page: pageToLoad,
            pageSize: PAGE_SIZE,
          },
          token
        );
        const payload = unwrap(result);
        setHistory(normalizeGenerations(payload.items || []));
        setHistoryMeta({
          page: payload.page || pageToLoad,
          pageSize: payload.pageSize || PAGE_SIZE,
          total: payload.total || 0,
        });
        setErrors((prev) => ({ ...prev, history: "" }));
      } catch (err) {
        setHistory([]);
        const message =
          err?.status === 401
            ? AUTH_ERROR_MESSAGE
            : err?.message || "Không thể tải lượt sinh gần đây";
        setErrors((prev) => ({
          ...prev,
          history: message,
        }));
      } finally {
        setLoading((prev) => ({ ...prev, history: false }));
      }
    },
    [token, unwrap, historyPage]
  );

  const loadUserStats = useCallback(
    async (pageToLoad = userPage) => {
      setLoading((prev) => ({ ...prev, users: true }));
      try {
        const res = await fetchGenerationsByUser(
          {
            page: pageToLoad,
            pageSize: PAGE_SIZE,
          },
          token
        );
        const payload = unwrap(res);
        setAccountStats(normalizeUserStats(payload.items || []));
        setUserMeta({
          page: payload.page || pageToLoad,
          pageSize: payload.pageSize || PAGE_SIZE,
          total: payload.total || 0,
        });
        setErrors((prev) => ({ ...prev, users: "" }));
      } catch (err) {
        setAccountStats([]);
        const message =
          err?.status === 401
            ? AUTH_ERROR_MESSAGE
            : err?.message || "Không thể tải thống kê theo tài khoản";
        setErrors((prev) => ({
          ...prev,
          users: message,
        }));
      } finally {
        setLoading((prev) => ({ ...prev, users: false }));
      }
    },
    [token, unwrap, userPage]
  );

  const loadGenerationsForUser = useCallback(
    async (user, pageToLoad = 1) => {
      if (!user) return;
      setLoading((prev) => ({ ...prev, selectedUser: true }));
      try {
        const res = await fetchAdminGenerations(
          {
            page: pageToLoad,
            pageSize: PAGE_SIZE,
            userId: user.id,
          },
          token
        );
        const payload = unwrap(res);
        setSelectedUserGenerations(payload.items || []);
        setSelectedUserMeta({
          page: payload.page || pageToLoad,
          pageSize: payload.pageSize || PAGE_SIZE,
          total: payload.total || 0,
        });
        setErrors((prev) => ({ ...prev, selectedUser: "" }));
      } catch (err) {
        setSelectedUserGenerations([]);
        const message =
          err?.status === 401
            ? AUTH_ERROR_MESSAGE
            : err?.message || "Không thể tải chi tiết lượt generate theo tài khoản";
        setErrors((prev) => ({
          ...prev,
          selectedUser: message,
        }));
      } finally {
        setLoading((prev) => ({ ...prev, selectedUser: false }));
      }
    },
    [token, unwrap]
  );

  useEffect(() => {
    loadRecentGenerations(historyPage);
  }, [historyPage, loadRecentGenerations]);

  useEffect(() => {
    loadUserStats(userPage);
  }, [loadUserStats, userPage]);

  const handleSelectAccount = (account) => {
    if (!account) return;
    const normalized = {
      id: account.id,
      email: account.email,
      role: account.role,
    };
    setSelectedUser(normalized);
    setSelectedUserMeta((prev) => ({ ...prev, page: 1 }));
    loadGenerationsForUser(normalized, 1);
  };

  const handleUpdateStatus = (id, newStatus) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleForceClear = () => {
    setHistoryPage(1);
    setUserPage(1);
    loadRecentGenerations(1);
    loadUserStats(1);
  };

  const handleDeleteGeneration = async (generationId) => {
    if (!generationId || !selectedUser) return;
    try {
      await deleteAdminGeneration(generationId, token);
      // Làm mới danh sách chi tiết của user
      loadGenerationsForUser(selectedUser, selectedUserMeta.page || 1);
      // Đồng thời cập nhật lại bảng tổng quan gần đây
      loadRecentGenerations(historyPage);
    } catch (err) {
      const message =
        err?.status === 401
          ? AUTH_ERROR_MESSAGE
          : err?.message || "Không thể xóa bản ghi generate";
      setErrors((prev) => ({
        ...prev,
        selectedUser: message,
      }));
    }
  };

  return (
    <AdminDashboard
      history={history}
      historyMeta={historyMeta}
      accountStats={accountStats}
      accountMeta={userMeta}
      selectedUser={selectedUser}
      selectedUserGenerations={selectedUserGenerations}
      selectedUserMeta={selectedUserMeta}
      loading={loading}
      errors={errors}
      onUpdateStatus={handleUpdateStatus}
      onForceClear={handleForceClear}
      onSelectAccount={handleSelectAccount}
      onDeleteGeneration={handleDeleteGeneration}
      onNextHistoryPage={() => {
        if (historyPage * historyMeta.pageSize < historyMeta.total) {
          setHistoryPage((prev) => prev + 1);
        }
      }}
      onPrevHistoryPage={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
      onNextAccountPage={() => {
        if (userPage * userMeta.pageSize < userMeta.total) {
          setUserPage((prev) => prev + 1);
        }
      }}
      onPrevAccountPage={() => setUserPage((prev) => Math.max(1, prev - 1))}
      onReloadHistory={() => loadRecentGenerations(historyPage)}
      onReloadAccounts={() => loadUserStats(userPage)}
      onNextSelectedUserPage={() => {
        if (
          selectedUser &&
          selectedUserMeta.page * selectedUserMeta.pageSize <
            selectedUserMeta.total
        ) {
          const nextPage = (selectedUserMeta.page || 1) + 1;
          setSelectedUserMeta((prev) => ({ ...prev, page: nextPage }));
          loadGenerationsForUser(selectedUser, nextPage);
        }
      }}
      onPrevSelectedUserPage={() => {
        if (!selectedUser) return;
        const prevPage = Math.max(1, (selectedUserMeta.page || 1) - 1);
        setSelectedUserMeta((prev) => ({ ...prev, page: prevPage }));
        loadGenerationsForUser(selectedUser, prevPage);
      }}
      onReloadSelectedUser={() => {
        if (!selectedUser) return;
        loadGenerationsForUser(
          selectedUser,
          selectedUserMeta.page || 1
        );
      }}
    />
  );
}

export default AdminDashboardPage;
