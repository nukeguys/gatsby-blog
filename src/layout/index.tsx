import React from 'react';
import Header from 'components/Header';
import Footer from 'components/Footer';
import { IMenu, ISiteMetadata } from 'type';
import 'style/custom.scss';

export interface ILayoutProps {
  siteMetadata: ISiteMetadata;
  children: any;
  showIntro: boolean;
  intro?: string;
}

const items: IMenu[] = [
  { name: 'DEV', path: '/dev' },
  { name: 'LIFE', path: '/life' },
  { name: 'BOOK', path: '/book' },
];
class Layout extends React.Component<ILayoutProps> {
  render() {
    const {
      siteMetadata: { title, description },
      children,
      showIntro,
      intro,
    } = this.props;
    return (
      <section className="hero">
        <div className="hero-head">
          <Header title={title} menuItems={items} />
          {showIntro && (
            <div id="intro" className="has-text-centered is-hidden-mobile">
              <span className="is-size-7 is-marginless">
                {intro || description}
              </span>
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
