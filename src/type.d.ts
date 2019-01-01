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
  };
}

export interface ISite {
  siteMetadata: {
    title: string;
    author: string;
  };
}

export interface IMenu {
  name: string;
  path: string;
}
