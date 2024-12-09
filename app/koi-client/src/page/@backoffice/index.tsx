import React from 'react';
import { Link } from 'react-router-dom';

const Backoffice = () => {
  return (
    <>
      <Link to="/backoffice/party">파티 관리</Link>
      <br />
      <Link to="/backoffice/poll">투표 관리</Link>
      <br />
      <Link to="/backoffice/stock">주식게임 관리</Link>
    </>
  );
};

export default Backoffice;
