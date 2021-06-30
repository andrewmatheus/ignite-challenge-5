import { useEffect, useRef } from 'react';

type UtterancesCommentsProps = {
  repositoryURL: string;
  issueTerm: string;
  label: string;
  theme: string;
  crossOrigin: string;
  async: boolean;
};

export function Comments({
  async = false,
  crossOrigin,
  issueTerm,
  label,
  repositoryURL,
  theme,
}: UtterancesCommentsProps): JSX.Element {
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptElement = document.createElement('script');

    scriptElement.src = 'https://utteranc.es/client.js';
    scriptElement.setAttribute('repo', repositoryURL);
    scriptElement.setAttribute('issue-term', issueTerm);
    scriptElement.setAttribute('label', label);
    scriptElement.setAttribute('theme', theme);
    scriptElement.crossOrigin = crossOrigin;
    scriptElement.async = async;
    commentsRef.current.appendChild(scriptElement);
  }, [async, crossOrigin, issueTerm, label, repositoryURL, theme]);

  return <section ref={commentsRef} />;
}
