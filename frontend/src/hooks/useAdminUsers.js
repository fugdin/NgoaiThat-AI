import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAdminUsers } from "../api/admin";

const DEFAULT_QUERY = {
  page: 1,
  pageSize: 20,
  search: "",
  role: "all",
};

function normalizeUsers(items = []) {
  return items.map((item) => ({
    id: item.Id,
    email: item.Email,
    role: item.Role,
    createdAt: item.CreatedAt,
    generationCount: item.GenerationCount || 0,
    lastGenerationAt: item.LastGenerationAt,
  }));
}

function useAdminUsers(token) {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: DEFAULT_QUERY.page,
    pageSize: DEFAULT_QUERY.pageSize,
    roleSummary: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const queryRef = useRef(DEFAULT_QUERY);

  const loadUsers = useCallback(
    async (override = {}) => {
      const nextQuery = {
        ...queryRef.current,
        ...override,
      };

      const apiQuery = {
        ...nextQuery,
        role: nextQuery.role === "all" ? "" : nextQuery.role,
      };

      queryRef.current = nextQuery;
      setQuery(nextQuery);
      setLoading(true);
      try {
        const response = await fetchAdminUsers(apiQuery, token);
        const payload = response?.data || {};
        setUsers(normalizeUsers(payload.items || []));
        setMeta({
          total: payload.total || 0,
          page: payload.page || nextQuery.page,
          pageSize: payload.pageSize || nextQuery.pageSize,
          roleSummary: payload.roleSummary || {},
        });
        setError("");
        return payload;
      } catch (err) {
        setError(err?.message || "Không thể tải danh sách người dùng");
        setUsers([]);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    loadUsers(DEFAULT_QUERY);
  }, [loadUsers]);

  return {
    users,
    loading,
    error,
    query,
    meta,
    refresh: loadUsers,
  };
}

export default useAdminUsers;
