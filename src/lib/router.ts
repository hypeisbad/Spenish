import { useEffect, useState } from 'react';
import { IS_ARTIFACT } from './host';

/**
 * Minimal router: #/path/segments?query=1 on any static host.
 * In the claude.ai preview build the viewer only passes plain #names through,
 * so routes live in memory there and in-app links are intercepted.
 */

export interface Route {
  path: string;
  parts: string[];
  query: URLSearchParams;
}

function parseRaw(raw: string): Route {
  const [p, q = ''] = (raw || '/').split('?');
  const path = p.startsWith('/') ? p : '/' + p;
  return { path, parts: path.split('/').filter(Boolean).map(decodeURIComponent), query: new URLSearchParams(q) };
}

let memPath = '/';
const memStack: string[] = [];
const MEM_EVENT = 'spenish:navigate';

function current(): Route {
  if (IS_ARTIFACT) return parseRaw(memPath);
  return parseRaw(window.location.hash.replace(/^#/, ''));
}

if (IS_ARTIFACT && typeof document !== 'undefined') {
  // Intercept <a href="#/..."> clicks so they route in memory.
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.('a[href^="#/"]') as HTMLAnchorElement | null;
    if (!a) return;
    e.preventDefault();
    navigate(a.getAttribute('href')!.slice(1));
  });
}

export function useRoute(): Route {
  const [route, setRoute] = useState(current);
  useEffect(() => {
    const on = () => setRoute(current());
    const ev = IS_ARTIFACT ? MEM_EVENT : 'hashchange';
    window.addEventListener(ev, on);
    return () => window.removeEventListener(ev, on);
  }, []);
  return route;
}

export function navigate(to: string) {
  const clean = to.replace(/^#/, '');
  const path = clean.startsWith('/') ? clean : '/' + clean;
  if (IS_ARTIFACT) {
    if (path !== memPath) memStack.push(memPath);
    memPath = path;
    window.dispatchEvent(new Event(MEM_EVENT));
    return;
  }
  const target = '#' + path;
  if (window.location.hash === target) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = target;
  }
}

export function back(fallback = '/') {
  if (IS_ARTIFACT) {
    memPath = memStack.pop() ?? fallback;
    window.dispatchEvent(new Event(MEM_EVENT));
    return;
  }
  if (window.history.length > 1) window.history.back();
  else navigate(fallback);
}
