import React from 'react';

const Footer = () => {
  return (
    <footer id="footer" className="footer has-text-grey is-size-7">
      <p>
        <a className="icon" href="https://github.com/nukeguys">
          <i className="fa fa-github fa-lg" />
        </a>
        <a
          className="icon"
          href="https://www.linkedin.com/in/seung-kyu-sung-42695241"
        >
          <i className="fa fa-linkedin fa-lg" />
        </a>
        <a className="icon" href="mailto:nukeguys0@gmail.com">
          <i className="fa fa-envelope fa-lg" />
        </a>
        <a className="icon" href="/rss.xml">
          <i className="fa fa-rss fa-lg" />
        </a>
      </p>
      <p className="is-uppercase">
        © 2018 <a href="/about ">nukeguys</a> All right reserved. Built with{' '}
        <a href="https://www.gatsbyjs.org/">Gatsby.js</a>+
        <a href="https://bulma.io/">Bulma</a>
      </p>
    </footer>
  );
};

export default Footer;
