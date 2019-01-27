import React from 'react';
import Helmet from 'react-helmet';
import { StaticQuery, graphql } from 'gatsby';

export interface ISeoProps {
  description?: string;
  lang?: string;
  meta?: [];
  keywords?: string[];
  title: string;
}

function SEO({
  description,
  lang = 'en',
  meta = [],
  keywords = [],
  title,
}: ISeoProps) {
  return (
    <StaticQuery
      query={detailsQuery}
      // tslint:disable-next-line:jsx-no-lambda
      render={data => {
        const metaDescription =
          description || data.site.siteMetadata.description;
        return (
          <Helmet
            htmlAttributes={{
              lang,
            }}
            title={title}
            meta={[
              {
                name: `description`,
                content: metaDescription,
              },
              {
                property: `og:title`,
                content: title,
              },
              {
                property: `og:description`,
                content: metaDescription,
              },
              {
                property: `og:type`,
                content: `website`,
              },
              {
                name: `twitter:card`,
                content: `summary`,
              },
              {
                name: `twitter:creator`,
                content: data.site.siteMetadata.author,
              },
              {
                name: `twitter:title`,
                content: title,
              },
              {
                name: `twitter:description`,
                content: metaDescription,
              },
              {
                name: `google-site-verification`,
                content: data.site.siteMetadata.google_site_verification,
              },
              {
                name: `naver-site-verification`,
                content: data.site.siteMetadata.naver_site_verification,
              },
            ]
              .concat(
                keywords.length > 0
                  ? {
                      name: `keywords`,
                      content: keywords.join(`, `),
                    }
                  : []
              )
              .concat(meta)}
          />
        );
      }}
    />
  );
}

export default SEO;

const detailsQuery = graphql`
  query DefaultSEOQuery {
    site {
      siteMetadata {
        title
        description
        author
        google_site_verification
        naver_site_verification
      }
    }
  }
`;
