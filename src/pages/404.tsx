import React from 'react';

import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { IPageProps } from './common';

class NotFoundPage extends React.Component<IPageProps> {
  render() {
    return (
      <Layout hasHeader={false} hasFooter={false}>
        <SEO title="404: Not Found" />
        <h1>Not Found</h1>
        <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
      </Layout>
    );
  }
}

export default NotFoundPage;
