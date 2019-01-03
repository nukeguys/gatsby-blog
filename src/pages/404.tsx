import React from 'react';

import Layout from 'layout/index';
import SEO from 'components/SEO';
import { IPageProps } from './common';

class NotFoundPage extends React.Component<IPageProps> {
  render() {
    return (
      <Layout>
        <SEO title="404: Not Found" />
        <h1>Not Found</h1>
        <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
      </Layout>
    );
  }
}

export default NotFoundPage;
