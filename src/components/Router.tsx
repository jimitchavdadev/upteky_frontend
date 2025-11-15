import { useState, useEffect } from 'react';

interface RouterProps {
  children: (route: string, params: Record<string, string>) => JSX.Element;
}

export default function Router({ children }: RouterProps) {
  const [route, setRoute] = useState(window.location.pathname);
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname);
      parseParams(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    parseParams(window.location.pathname);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const parseParams = (path: string) => {
    const formMatch = path.match(/^\/form\/(.+)$/);
    if (formMatch) {
      setParams({ formId: formMatch[1] });
    } else {
      setParams({});
    }
  };

  return children(route, params);
}

export function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
