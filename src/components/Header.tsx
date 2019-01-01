import React from 'react';
import GatsbyLink from 'gatsby-link';
import classnames from 'classnames';
import { IMenu } from 'type';
import './Header.scss';

interface IHeaderProps {
  title: string;
  menuItems: IMenu[];
}

interface IHeaderState {
  activeMenu: boolean;
}

export default class Header extends React.Component<
  IHeaderProps,
  IHeaderState
> {
  constructor(props: IHeaderProps) {
    super(props);
    this.state = { activeMenu: false };
  }

  onClickBuger: React.MouseEventHandler<HTMLAnchorElement> = () => {
    this.setState({ activeMenu: !this.state.activeMenu });
  };

  render() {
    const { title, menuItems } = this.props;
    const { activeMenu } = this.state;

    return (
      <nav
        id="header-navbar"
        className={classnames('navbar', {
          'is-active': activeMenu,
        })}
        role="navigation"
        aria-label="main navigation"
      >
        <div className="navbar-brand">
          <a
            className="navbar-item is-uppercase has-text-weight-bold is-size-7"
            href="https://bulma.io"
          >
            {title}
          </a>

          <a
            className={classnames('navbar-burger', 'burger', {
              'is-active': activeMenu,
            })}
            role="button"
            aria-label="menu"
            aria-expanded="false"
            onClick={this.onClickBuger}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </a>
        </div>

        <div
          className={classnames('navbar-menu', {
            'is-active': activeMenu,
          })}
        >
          <div className="navbar-start">
            {menuItems.map(menu => (
              <React.Fragment key={menu.name}>
                <GatsbyLink
                  key={menu.name}
                  className="navbar-item is-size-7"
                  to={menu.path}
                  onClick={this.onClickBuger}
                >
                  {menu.name}
                </GatsbyLink>
                <div key="divider" className="vertical-divider">
                  <div className="divider" />
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </nav>
    );
  }
}
