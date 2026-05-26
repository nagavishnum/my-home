import { useEffect, useState } from "react";
import { subscribeLoader } from './apiLoader';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export function useGlobalApiLoading() {
  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    return subscribeLoader(setLoading);
  }, []);

  return loading;
}