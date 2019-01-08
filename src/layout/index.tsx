import React from 'react';
import Header from 'components/Header';
import Footer from 'components/Footer';
import { IMenu, ISiteMetadata } from 'type';
import 'style/custom.scss';

export interface ILayoutProps {
  siteMetadata: ISiteMetadata;
  children: any;
  showIntro: boolean;
}

const items: IMenu[] = [
  // { name: 'ABOUT', path: '/' },
  // { name: 'TAG', path: '/' },
];
class Layout extends React.Component<ILayoutProps> {
  render() {
    const {
      siteMetadata: { title, description },
      children,
      showIntro,
    } = this.props;
    return (
      <section className="hero">
        <div className="hero-head">
          <Header title={title} menuItems={items} />
          {showIntro && (
            <div id="intro" className="has-text-centered is-hidden-mobile">
              <b className="is-size-7 is-marginless">{description}</b>
            </div>
          )}
        </div>
        <main className="container is-desktop">
          <div className="hero-body is-paddingless">{children}</div>
          <div className="hero-footer">
            <Footer />
          </div>
        </main>
      </section>
    );
  }
}

export default Layout;
