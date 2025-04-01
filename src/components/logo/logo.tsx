import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { Box, Link, BoxProps } from '@mui/material';

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx, ...other }, ref) => {
    
    const logo = (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
      }}>
        <Box
          component="img"
          src="/logo/yuil.png"
          sx={{ width: 98, height: 37, cursor: 'pointer', ...sx }}
        />
      </div>
    );


    if (disabledLink) {
      return logo;
    }

    return (
      <Link component={RouterLink} to="/" sx={{ display: 'contents' }}>
        {logo}
      </Link>
    );
  }
);

export default Logo;
