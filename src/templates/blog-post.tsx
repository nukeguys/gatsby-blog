import React from 'react';
import { Link, graphql } from 'gatsby';

import Layout from '../layout/index';
import SEO from '../components/SEO';
import { IPageProps } from '../pages/common';
import { ISite, IMarkdownRemark } from '../type';

interface IProps extends IPageProps {
  data: {
    site: ISite;
    markdownRemark: IMarkdownRemark;
  };
}

class BlogPostTemplate extends React.Component<IProps> {
  render() {
    const {
      data: { markdownRemark: post, site },
      pageContext: { previous, next },
    } = this.props;

    return (
      <Layout siteMetadata={site.siteMetadata}>
        <SEO title={post.frontmatter.title} description={post.excerpt} />
        <h1>{post.frontmatter.title}</h1>
        <p
          style={{
            display: `block`,
            marginBottom: 10,
            marginTop: 10,
          }}
        >
          {post.frontmatter.date}
        </p>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
        <hr
          style={{
            marginBottom: 20,
          }}
        />

        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </Layout>
    );
  }
}

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
      }
    }
  }
`;
