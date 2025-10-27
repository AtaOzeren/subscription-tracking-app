/// <reference types="nativewind/types" />

declare module '*.css' {
  const content: string;
  export default content;
}

import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
}
