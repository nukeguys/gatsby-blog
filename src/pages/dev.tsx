import React from 'react';
import { graphql } from 'gatsby';
import Layout from 'layout/index';
import SEO from 'components/Seo';
import { IPageProps } from '../common';
import { ISite, IAllMarkdownRemark } from 'type';
import PosterList from 'components/PosterList';

interface IProps extends IPageProps {
  data: {
    site: ISite;
    allMarkdownRemark: IAllMarkdownRemark;
  };
}

const intro = 'A clever person solves a problem. A wise person AVOIDS it.';

class DevIndex extends React.Component<IProps> {
  render() {
    const { site, allMarkdownRemark } = this.props.data;
    const posts = allMarkdownRemark ? allMarkdownRemark.edges : [];

    return (
      <Layout siteMetadata={site.siteMetadata} showIntro={true} intro={intro}>
        <SEO
          title="nuKeguyS"
          keywords={[`blog`, `gatsby`, `javascript`, `react`]}
        />
        <PosterList posts={posts} />
      </Layout>
    );
  }
}

export default DevIndex;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { category: { eq: "dev" } } }
    ) {
      edges {
        node {
          excerpt
          html
          fields {
            slug
          }
          frontmatter {
            date(formatString: "YYYY/MM/DD")
            title
            description
            tags
          }
        }
      }
    }
  }
`;
