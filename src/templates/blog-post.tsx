import React from 'react';
import { Link, graphql } from 'gatsby';
import Layout from '../layout/index';
import SEO from '../components/Seo';
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
      <Layout siteMetadata={site.siteMetadata} showIntro={false}>
        <SEO title={post.frontmatter.title} description={post.excerpt} />
        <section id="blog-post">
          <div className="has-text-weight-semibold is-size-3 is-size-4-mobile">
            {post.frontmatter.title}
          </div>
          <div className="is-size-7 is-size-7-mobile">
            {post.frontmatter.date}
          </div>
          <div className="summary is-size-6 is-size-6-mobile">
            {post.frontmatter.description}
          </div>
          <div className="tags">
            {post.frontmatter.tags.map(tag => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
          <article
            className="content"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
          <nav className="level">
            <div className="level-left">
              {previous && (
                <Link to={previous.fields.slug} rel="prev">
                  ← {previous.frontmatter.title}
                </Link>
              )}
            </div>
            <div className="level-right">
              {next && (
                <Link to={next.fields.slug} rel="next">
                  {next.frontmatter.title} →
                </Link>
              )}
            </div>
          </nav>
        </section>
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
        date(formatString: "YYYY/MM/DD HH:mm")
        tags
        description
      }
    }
  }
`;