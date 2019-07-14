import React from 'react';

import Layout from 'layout/index';
import SEO from 'components/Seo';
import { graphql } from 'gatsby';
import { ISite } from 'type';
import Video from 'components/Video';

interface IProps {
  data: {
    site: ISite;
  };
}

class NotFoundPage extends React.Component<IProps> {
  render() {
    const { site } = this.props.data;
    return (
      <Layout siteMetadata={site.siteMetadata} showIntro={true}>
        <SEO title="404: Not Found" />
        <Video
          videoSrcURL={URLS[Math.floor(Math.random() * 4)]}
          videoTitle=""
          style={{ marginTop: '30px' }}
        />
        <div className="has-text-centered" style={{ marginTop: '30px' }}>
          <a href="/">홈으로 가기</a>
        </div>
      </Layout>
    );
  }
}

const URLS = [
  'https://www.youtube.com/embed/MCcJMjiAdfQ',
  'https://www.youtube.com/embed/dN44xpHjNxE',
  'https://www.youtube.com/embed/dmSUBdk4SY4',
  'https://www.youtube.com/embed/nuLLEhmpxJo',
];

export default NotFoundPage;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
  }
`;
