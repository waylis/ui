export const getQueryParam = (key: string): string | null => {
  return new URLSearchParams(window.location.search).get(key);
};

export const setQueryParam = (key: string, value: string | null): void => {
  const url = new URL(window.location.href);

  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }

  window.history.replaceState({}, "", url);
};
