import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value);
  //console.log("useDebounce called with value:", value, "and delay:", delay);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
};
