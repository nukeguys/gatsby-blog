import React from 'react';
import Header from './Header';
import Footer from './Footer';

export interface ILayoutProps {
  title: string;
  children: any;
  hasHeader: boolean;
  hasFooter: boolean;
}

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
        {hasHeader && <Header title={title} />}
        {children}
        {hasFooter && <Footer />}
      </>
    );
  }
}

export default Layout;
