import React, { useEffect } from 'react';

export default function AdSense() {
  useEffect(() => {
    if (window.adsbygoogle) {
      window.adsbygoogle.push({});
    }
  }, []);

  return (
    <>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-3555505602575174"
        data-ad-slot="9587027628"
      />
    </>
  );
}
