import React from 'react';
import { Link, graphql } from 'gatsby';
import Layout from 'layout/index';
import SEO from 'components/Seo';
import { IPageProps } from '../common';
import { ISite, IAllMarkdownRemark } from 'type';
import Post from 'components/Post';

interface IProps extends IPageProps {
  data: {
    site: ISite;
    allMarkdownRemark: IAllMarkdownRemark;
  };
}

class BlogIndex extends React.Component<IProps> {
  render() {
    const { site, allMarkdownRemark } = this.props.data;
    const posts = allMarkdownRemark.edges;

    return (
      <Layout siteMetadata={site.siteMetadata} showIntro={true}>
        <SEO
          title="All posts"
          keywords={[`blog`, `gatsby`, `javascript`, `react`]}
        />
        {posts.map(({ node }) => {
          return (
            <div className="postItem" key={node.fields.slug}>
              <Link className="postLink" to={node.fields.slug}>
                <Post post={node} />
              </Link>
            </div>
          );
        })}
      </Layout>
    );
  }
}

export default BlogIndex;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
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
