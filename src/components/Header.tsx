import React from 'react';

interface IHeaderProps {
  title: string;
}

const Header = ({ title }: IHeaderProps) => {
  return <div>{title}</div>;
};

export default Header;
