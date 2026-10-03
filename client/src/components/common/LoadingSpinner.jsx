import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const LOTTIE_URL = 'https://lottie.host/db3bceb5-2e81-4dc1-b0a3-eb751a282527/p3LPvzKXBV.lottie';

  const dimensionClasses = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-40 h-40',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-2">
      <div className={`${dimensionClasses[size] || dimensionClasses.md} flex items-center justify-center overflow-hidden`}>
        <DotLottieReact
          src={LOTTIE_URL}
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {text && <p className="text-xs font-semibold text-zinc-400 tracking-wide uppercase font-sans animate-pulse">{text}</p>}
    </div>
  );
}
