// apiLoader.ts
let activeRequests = 0;

const listeners = new Set<(loading: boolean) => void>();

const notify = () => {
  const isLoading = activeRequests > 0;

  listeners.forEach((listener) =>
    listener(isLoading)
  );
};

export const startLoading = () => {
  activeRequests++;
  notify();
};

export const stopLoading = () => {
  activeRequests = Math.max(
    0,
    activeRequests - 1
  );

  notify();
};

export const subscribeLoader = (
  listener: (loading: boolean) => void
) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};