import React from 'react';
import { Link, graphql } from 'gatsby';
import Layout from '../layout/index';
import SEO from '../components/Seo';
import { IPageProps } from '../common';
import { ISite, IMarkdownRemark } from '../type';
// @ts-ignore
import AdSense from 'react-adsense';
import Helmet from 'react-helmet';

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
        <Helmet
          script={[
            {
              async: true,
              src: '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
            },
            {
              innerHTML: `(adsbygoogle = window.adsbygoogle || []).push(
                google_ad_client: '${site.siteMetadata.google_ad_client}',
                enable_page_level_ads: true
           });`,
            },
          ]}
        />
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
          {/* <div className="adsense">
            <script
              async
              src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
            />
            <AdSense.Google
              client={site.siteMetadata.google_ad_client}
              slot="5458722341"
              style={{ display: 'block' }}
              format="auto"
              responsive="true"
            />
            <script
              dangerouslySetInnerHTML={{
                __html:
                  '(window.adsbygoogle = window.adsbygoogle || []).push({});',
              }}
            />
          </div> */}
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
        google_ad_client
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
