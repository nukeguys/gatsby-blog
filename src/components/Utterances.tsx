import React, { useRef, useEffect } from 'react';

export default function Utterances() {
  const rootElm = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const utterancesEl = rootElm.current;
    if (utterancesEl) {
      const utterances = document.createElement('script');
      utterances.src = 'https://utteranc.es/client.js';
      utterances.async = true;
      utterances.setAttribute('repo', 'nukeguys/nukeguys.github.io');
      utterances.setAttribute('crossorigin', 'anonymous');
      utterances.setAttribute('issue-term', 'pathname');
      utterances.setAttribute('theme', 'github-light');

      utterancesEl.appendChild(utterances);
    }
  }, []);

  return <div ref={rootElm} />;
}
