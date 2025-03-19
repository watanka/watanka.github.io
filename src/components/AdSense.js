// src/components/AdSense.tsx
import React, { useEffect, useRef } from 'react';
import { useLocation } from '@docusaurus/router';

export default function AdSense() {
  const elementRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    try {
      const adsbygoogle = window.adsbygoogle;
      if (adsbygoogle && elementRef.current) {
        adsbygoogle.push({});
      }
    } catch (err) {
      console.error('AdSense 에러:', err);
    }
  }, [location]); // 페이지 변경시마다 광고 새로고침

  return (
    <div className="ad-container">
      <ins
        ref={elementRef}
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-3555505602575174"
        data-ad-slot="9587027628"
      />
    </div>
  );
}