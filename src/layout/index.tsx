import React from 'react';
import Header from 'components/Header';
import Footer from 'components/Footer';
import { IMenu, ISiteMetadata } from 'type';
import 'style/custom.scss';
import './layout.scss';
export interface ILayoutProps {
  siteMetadata: ISiteMetadata;
  children: any;
}

const items: IMenu[] = [
  { name: 'ABOUT', path: '/' },
  { name: 'TAG', path: '/' },
];
class Layout extends React.Component<ILayoutProps> {
  static defaultProps = {
    title: '',
  };

  render() {
    const {
      siteMetadata: { title, description },
      children,
    } = this.props;
    return (
      <section className="hero">
        <div className="hero-head">
          <Header title={title} menuItems={items} />
          <div id="intro" className="has-text-centered is-hidden-mobile">
            <h2 className="is-size-7 is-marginless">"{description}"</h2>
          </div>
        </div>
        <main className="container is-desktop">
          <div className="hero-body is-paddingless">
            <div>{children}</div>
          </div>
          <div className="hero-footer">
            <Footer />
          </div>
        </main>
      </section>
    );
  }
}

export default Layout;
