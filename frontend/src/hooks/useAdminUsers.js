import { useCallback, useEffect, useRef, useState } from "react";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUser,
} from "../api/admin";

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
  const unwrap = useCallback((response) => response?.data ?? response ?? {}, []);

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
        const payload = unwrap(response);
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
        setError(err?.message || "Kh?ng th? t?i danh s?ch ng??i d?ng");
        setUsers([]);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, unwrap]
  );

  useEffect(() => {
    loadUsers(DEFAULT_QUERY);
  }, [loadUsers]);

  const createUser = useCallback(
    async (payload) => {
      setLoading(true);
      try {
        const res = await createAdminUser(payload, token);
        await loadUsers(queryRef.current);
        return { ok: true, data: unwrap(res) };
      } catch (err) {
        setError(err?.message || "Kh?ng th? t?o t?i kho?n");
        return { ok: false, message: err?.message };
      } finally {
        setLoading(false);
      }
    },
    [loadUsers, token, unwrap]
  );

  const updateUser = useCallback(
    async (id, payload) => {
      setLoading(true);
      try {
        const res = await updateAdminUser(id, payload, token);
        await loadUsers(queryRef.current);
        return { ok: true, data: unwrap(res) };
      } catch (err) {
        setError(err?.message || "Kh?ng th? c?p nh?t t?i kho?n");
        return { ok: false, message: err?.message };
      } finally {
        setLoading(false);
      }
    },
    [loadUsers, token, unwrap]
  );

  const removeUser = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const res = await deleteAdminUser(id, token);
        await loadUsers(queryRef.current);
        return { ok: true, data: unwrap(res) };
      } catch (err) {
        setError(err?.message || "Kh?ng th? x?a t?i kho?n");
        return { ok: false, message: err?.message };
      } finally {
        setLoading(false);
      }
    },
    [loadUsers, token, unwrap]
  );

  const updateRole = useCallback(
    (id, role) => updateUser(id, { role }),
    [updateUser]
  );

  return {
    users,
    loading,
    error,
    query,
    meta,
    refresh: loadUsers,
    createUser,
    updateUser,
    removeUser,
    updateRole,
  };
}

export default useAdminUsers;
