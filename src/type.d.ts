export interface IAllMarkdownRemark {
  edges: INode[];
}

export interface INode {
  node: IMarkdownRemark;
}

export interface IMarkdownRemark {
  id: string;
  excerpt: string;
  html: string;
  fields: {
    slug: string;
  };
  frontmatter: {
    title: string;
    date: string;
    description: string;
    tags: string[];
  };
}

export interface ISite {
  siteMetadata: ISiteMetadata;
}

export interface ISiteMetadata {
  title: string;
  author: string;
  description: string;
  siteUrl: string;
}

export interface IMenu {
  name: string;
  path: string;
}
