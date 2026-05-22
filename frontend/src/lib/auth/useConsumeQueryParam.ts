import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  readQueryParam,
  stripSensitiveSearchParams,
} from "@/lib/auth/sensitiveUrl";

/**
 * Reads a query param once, then strips sensitive keys from the URL (replace navigation).
 * Keeps the value in React state so forms still work after the bar is cleaned.
 */
export function useConsumeQueryParam(param: string): string {
  const location = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = React.useState("");
  const consumedRef = React.useRef(false);

  React.useEffect(() => {
    const fromUrl = readQueryParam(location.search, param);
    if (fromUrl) {
      if (!consumedRef.current) {
        consumedRef.current = true;
        setValue(fromUrl);
      }
      const stripped = stripSensitiveSearchParams(location.search);
      if (stripped !== location.search) {
        const search = stripped.startsWith("?") ? stripped.slice(1) : stripped;
        navigate({ pathname: location.pathname, search }, { replace: true });
      }
      return;
    }

    if (!consumedRef.current) {
      setValue("");
    }
  }, [location.pathname, location.search, navigate, param]);

  return value;
}
