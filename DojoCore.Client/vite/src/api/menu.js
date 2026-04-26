import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// project imports
import { getIconComponent } from 'utils/iconMap';

const initialState = {
  isDashboardDrawerOpened: false
};

const endpoints = {
  key: 'api/menu',
  master: 'master'
};

export function useGetMenuMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.master, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      menuMaster: data,
      menuMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerDrawerOpen(isDashboardDrawerOpened) {
  mutate(
    endpoints.key + endpoints.master,
    (currentMenuMaster) => {
      return { ...currentMenuMaster, isDashboardDrawerOpened };
    },
    false
  );
}

// ==============================|| API MENU ||============================== //

/**
 * Recursively transforms an API menu item into the Berry menu format.
 *
 * depth 0 → type:'group'    (section header with title label, non-clickable)
 * depth 1+ with children → type:'collapse'  (expandable nav item)
 * depth 1+ without children → type:'item'   (leaf link)
 */
function transformMenuItem(apiItem, depth = 0) {
  const hasChildren = Array.isArray(apiItem.children) && apiItem.children.length > 0;

  let type;
  if (depth === 0) {
    type = 'group';
  } else if (hasChildren) {
    type = 'collapse';
  } else {
    type = 'item';
  }

  const item = {
    id: String(apiItem.id),
    title: apiItem.title,
    type,
    url: apiItem.url,
    icon: getIconComponent(apiItem.icon)
  };

  if (hasChildren) {
    item.children = apiItem.children.map((child) => transformMenuItem(child, depth + 1));
  }

  return item;
}

async function fetchApiMenu() {
  const response = await fetch('/api/menu', { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to load menu');
  const data = await response.json();
  // Sort top-level and all children by orderIndex before transforming
  const sorted = [...data].sort((a, b) => a.orderIndex - b.orderIndex);
  return sorted.map((item) => transformMenuItem(item, 0));
}

export function useGetApiMenu() {
  const { data, isLoading, error } = useSWR('/api/menu', fetchApiMenu, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      apiMenuItems: data ?? [],
      apiMenuLoading: isLoading,
      apiMenuError: error
    }),
    [data, isLoading, error]
  );

  return memoizedValue;
}

