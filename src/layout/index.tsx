import React from 'react';
import Header from 'components/Header';
import Footer from 'components/Footer';
import 'style/custom.scss';
import { IMenu } from 'type';

export interface ILayoutProps {
  title: string;
  children: any;
  hasHeader: boolean;
  hasFooter: boolean;
}

const items: IMenu[] = [
  { name: 'HOME', path: '/' },
  { name: 'TAG', path: '/' },
  { name: 'ABOUT', path: '/' },
];
class Layout extends React.Component<ILayoutProps> {
  static defaultProps = {
    title: '',
    hasHeader: true,
    hasFooter: true,
  };

  render() {
    const { title, children, hasHeader, hasFooter } = this.props;
    return (
      <>
        {hasHeader && <Header title={title} menuItems={items} />}
        {children}
        {hasFooter && <Footer />}
      </>
    );
  }
}

export default Layout;
