import React from 'react';
import { useMediaQuery } from 'react-responsive';
import DesktopHeader from './components/DesktopHeader';
import { MEDIA_QUERY } from '../../config/common';
import MobileHeader from './components/MobileHeader';

const Header = () => {
  const isDesktop = useMediaQuery({ query: MEDIA_QUERY.DESKTOP });

  return isDesktop ? <DesktopHeader /> : <MobileHeader />;
};
export default Header;
