// src/global.d.ts
import 'react';

declare module 'react' {
  interface InputHTMLAttributes<T> {
    /** Allow directory picking in WebKit browsers */
    webkitdirectory?: boolean | string;
    /** Older WebKit fallback */
    directory?: boolean | string;
  }
}