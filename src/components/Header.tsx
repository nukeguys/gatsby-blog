import React from 'react';
import GatsbyLink from 'gatsby-link';
import classnames from 'classnames';
import { IMenu } from 'type';

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

  onClickMenu: React.MouseEventHandler<HTMLAnchorElement> = () => {
    this.setState({ activeMenu: false });
  };

  render() {
    const { title, menuItems } = this.props;
    const { activeMenu } = this.state;

    return (
      <nav
        id="header"
        className={classnames('navbar has-background-white', {
          'is-active': activeMenu,
        })}
        role="navigation"
        aria-label="main navigation"
      >
        <div className="navbar-brand">
          <a
            className="navbar-item is-uppercase has-text-weight-bold is-size-7"
            href="/"
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
          <div className="navbar-end">
            {menuItems.map(menu => (
              <React.Fragment key={menu.name}>
                <GatsbyLink
                  key={menu.name}
                  className="navbar-item is-size-7"
                  to={menu.path}
                  onClick={this.onClickMenu}
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
