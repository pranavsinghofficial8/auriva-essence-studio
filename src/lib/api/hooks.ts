/**
 * React hooks over `lib/api` for the visitor's own state: account, bag and orders. They share one
 * TanStack Query cache (created per request in `router.tsx`), so the nav, bag, checkout and
 * account page stay in sync after any change. Server-rendered HTML shows the signed-out state;
 * the real state loads in the browser.
 */

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import * as api from "./index";
import type { Cart, Order, PaymentResult, User } from "./types";

export const queryKeys = {
  me: ["me"] as const,
  cart: ["cart"] as const,
  orders: ["orders"] as const,
  order: (id: string) => ["orders", id] as const,
  search: (query: string, limit?: number) => ["search", query, limit ?? null] as const,
};

export const EMPTY_CART: Cart = { lines: [], count: 0, subtotal: 0 };

/** The signed-in visitor, or null. `isLoading` is true until the first answer arrives. */
export function useUser() {
  const queryClient = useQueryClient();

  // The mock keeps state in localStorage: refresh when another tab changes it.
  useEffect(() => {
    if (!api.usingMockApi) return;
    const onStorage = (event: StorageEvent) => {
      if (event.key?.startsWith("auriva.")) void queryClient.invalidateQueries();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [queryClient]);

  const query = useQuery({ queryKey: queryKeys.me, queryFn: api.getMe, staleTime: 60_000 });
  return { user: query.data ?? null, isLoading: query.isPending };
}

/** The signed-in visitor's bag (empty when signed out). */
export function useCart() {
  const { user } = useUser();
  const query = useQuery({ queryKey: queryKeys.cart, queryFn: api.getCart, enabled: !!user });
  return { ...(query.data ?? EMPTY_CART), isLoading: !!user && query.isPending };
}

/** Add, change and remove bag lines. Each mutation stores the returned bag in the cache. */
export function useCartActions() {
  const queryClient = useQueryClient();
  const onSuccess = (cart: Cart) => queryClient.setQueryData(queryKeys.cart, cart);
  return {
    add: useMutation({
      mutationFn: ({ slug, qty = 1 }: { slug: string; qty?: number }) => api.addToCart(slug, qty),
      onSuccess,
    }),
    update: useMutation({
      mutationFn: ({ slug, qty }: { slug: string; qty: number }) => api.updateCartItem(slug, qty),
      onSuccess,
    }),
    remove: useMutation({ mutationFn: (slug: string) => api.removeCartItem(slug), onSuccess }),
  };
}

/** Sign in (email or Google), create an account, and sign out. */
export function useAuthActions() {
  const queryClient = useQueryClient();
  const signedIn = (user: User) => {
    queryClient.setQueryData(queryKeys.me, user);
    void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    void queryClient.invalidateQueries({ queryKey: queryKeys.orders });
  };
  return {
    signIn: useMutation({ mutationFn: api.signInWithEmail, onSuccess: signedIn }),
    signUp: useMutation({ mutationFn: api.signUp, onSuccess: signedIn }),
    signInWithGoogle: useMutation({ mutationFn: api.signInWithGoogle, onSuccess: signedIn }),
    signOut: useMutation({
      mutationFn: api.signOut,
      onSuccess: () => {
        queryClient.setQueryData(queryKeys.me, null);
        queryClient.removeQueries({ queryKey: queryKeys.cart });
        queryClient.removeQueries({ queryKey: queryKeys.orders });
      },
    }),
  };
}

/** The signed-in visitor's orders, newest first. */
export function useOrders() {
  const { user } = useUser();
  const query = useQuery({ queryKey: queryKeys.orders, queryFn: api.getOrders, enabled: !!user });
  return { orders: query.data ?? [], isLoading: !!user && query.isPending };
}

/** One of the signed-in visitor's orders (null if it isn't found). */
export function useOrder(id: string | undefined) {
  const { user, isLoading: userLoading } = useUser();
  const query = useQuery({
    queryKey: queryKeys.order(id ?? ""),
    queryFn: () => api.getOrder(id ?? ""),
    enabled: !!user && !!id,
  });
  return {
    order: query.data ?? null,
    isLoading: userLoading || (!!user && !!id && query.isPending),
    error: query.error,
  };
}

/** Once an order is placed or paid: empty the bag and cache the order. */
function useOrderCompleted() {
  const queryClient = useQueryClient();
  return (order: Order) => {
    queryClient.setQueryData(queryKeys.cart, EMPTY_CART);
    queryClient.setQueryData(queryKeys.order(order.id), order);
    void queryClient.invalidateQueries({ queryKey: queryKeys.orders, exact: true });
  };
}

/**
 * Turn the bag into an order. It resolves with the Razorpay session to pay with; the bag stays
 * until `useConfirmPayment` succeeds. With nothing to pay (`payment: null`), the order is done.
 */
export function usePlaceOrder() {
  const completed = useOrderCompleted();
  return useMutation({
    mutationFn: api.placeOrder,
    onSuccess: ({ order, payment }) => {
      if (!payment) completed(order);
    },
  });
}

/** Send Razorpay's result to the backend to verify. On success the bag is emptied. */
export function useConfirmPayment() {
  const completed = useOrderCompleted();
  return useMutation({
    mutationFn: ({ orderId, result }: { orderId: string; result: PaymentResult }) =>
      api.confirmPayment(orderId, result),
    onSuccess: completed,
  });
}

/**
 * As-you-type search suggestions for `query` (already debounced by the caller). Keeps showing
 * the previous results while the next ones load, so the list doesn't flicker.
 */
export function useSearchSuggestions(query: string, limit = 6) {
  const q = query.trim();
  const result = useQuery({
    queryKey: queryKeys.search(q, limit),
    queryFn: () => api.search(q, { limit }),
    enabled: q.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });
  return {
    results: q ? (result.data ?? null) : null,
    isLoading: !!q && result.isFetching,
    error: result.error,
  };
}
