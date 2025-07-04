declare module 'react-json-editor-ajrm' {
  import React from 'react';

  interface JSONInputProps {
    placeholder?: any;
    locale?: any;
    height?: string;
    width?: string;
    onChange?: (data: any) => void;
    onBlur?: (data: any) => void;
    onError?: (data: any) => void;
    theme?: string;
    colors?: any;
    style?: React.CSSProperties;
    className?: string;
  }

  const JSONInput: React.FC<JSONInputProps>;
  export default JSONInput;
}

declare module 'react-json-editor-ajrm/locale/en' {
  const locale: any;
  export default locale;
}
