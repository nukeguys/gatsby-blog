import React from 'react';

import Layout from 'layout/index';
import SEO from 'components/Seo';
import { graphql } from 'gatsby';
import { ISite } from 'type';

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

        <div className="section ">
          <h1 className="title">막다른 길</h1>
          길을 걷다가 막다른 길에 이르렀다.
          <br />
          여기가 어딜까?
          <br />
          주위를 둘러본다.
          <br />
          찬찬히 둘러본다.
          <br />
          흩어진 퍼즐조각처럼 모두가 낯선 길이다.
          <br />
          보이는 길이 낯설다면 안 보이는 길은 어떨까?
          <br />
          두눈을 감아본다.
          <br />
          방금 지나온 모퉁이길이 보인다.
          <br />
          꽃과 잎새가 그려진 벽화가 있는 담모퉁이다.
          <br />
          눈에 익은 벽화다.
          <br />
          그 자리에서 성큼 거어나오니 낯익은 길이다.
          <br />
          지금 내가 가야 할 길이 보인다.
          <br />
        </div>
      </Layout>
    );
  }
}

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
