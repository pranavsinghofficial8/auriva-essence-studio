import { useCallback, useEffect, useState } from "react";

import { getProduct, type Product } from "@/lib/auriva-catalog";

/**
 * Front-end only "commerce" layer. Accounts, bag and orders all live in the
 * browser (localStorage). No backend, no real payments — a demo flow.
 */

const ACCOUNT_KEY = "auriva.account";
const BAG_KEY = "auriva.bag";
const ORDER_KEY = "auriva.lastOrder";
const EVENT = "auriva:store";

export type Account = { name: string; email: string };
export type BagLine = { slug: string; qty: number };
export type Order = {
  id: string;
  placedAt: string;
  email: string;
  name: string;
  address: string;
  lines: { slug: string; name: string; qty: number; price: number }[];
  total: number;
};

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(new Event(EVENT));
}

/* ---------------------------------- account --------------------------------- */

export const getAccount = () => read<Account>(ACCOUNT_KEY);
export const signIn = (account: Account) => write(ACCOUNT_KEY, account);
export const signOut = () => write(ACCOUNT_KEY, null);

/* ------------------------------------ bag ----------------------------------- */

export const getBag = () => read<BagLine[]>(BAG_KEY) ?? [];

export function addToBag(slug: string, qty = 1) {
  const bag = getBag();
  const line = bag.find((l) => l.slug === slug);
  if (line) line.qty += qty;
  else bag.push({ slug, qty });
  write(BAG_KEY, bag);
}

export function setQty(slug: string, qty: number) {
  const bag = getBag()
    .map((l) => (l.slug === slug ? { ...l, qty } : l))
    .filter((l) => l.qty > 0);
  write(BAG_KEY, bag);
}

export const removeFromBag = (slug: string) => setQty(slug, 0);
export const clearBag = () => write(BAG_KEY, []);

/* ----------------------------------- orders --------------------------------- */

export const getLastOrder = () => read<Order>(ORDER_KEY);
export const saveOrder = (order: Order) => write(ORDER_KEY, order);

/* ----------------------------------- hooks ---------------------------------- */

function useStoreValue<T>(get: () => T, initial: T): T {
  const [value, setValue] = useState<T>(initial);
  const sync = useCallback(() => setValue(get()), [get]);

  useEffect(() => {
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  return value;
}

export function useAccount() {
  return useStoreValue<Account | null>(getAccount, null);
}

export type BagItem = { product: Product; qty: number };

export function useBag() {
  const lines = useStoreValue<BagLine[]>(getBag, []);
  const items: BagItem[] = lines
    .map((l) => {
      const product = getProduct(l.slug);
      return product ? { product, qty: l.qty } : null;
    })
    .filter((x): x is BagItem => x !== null);

  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((n, i) => n + i.qty * i.product.price, 0);

  return { items, count, subtotal };
}
