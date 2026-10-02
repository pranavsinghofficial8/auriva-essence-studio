/**
 * React hooks over `lib/api` for the visitor's own state: account, bag and orders. They share one
 * TanStack Query cache (created per request in `router.tsx`), so the nav, bag, checkout and
 * account page stay in sync after any change. Server-rendered HTML shows the signed-out state;
 * the real state loads in the browser.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import * as api from "./index";
import type { Cart, User } from "./types";

export const queryKeys = {
  me: ["me"] as const,
  cart: ["cart"] as const,
  orders: ["orders"] as const,
  order: (id: string) => ["orders", id] as const,
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

/** Turn the bag into an order. On success the bag is emptied and the order is cached. */
export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.placeOrder,
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.cart, EMPTY_CART);
      queryClient.setQueryData(queryKeys.order(order.id), order);
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders, exact: true });
    },
  });
}
