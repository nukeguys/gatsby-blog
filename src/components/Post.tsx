import React, { Component } from 'react';
import { IMarkdownRemark } from 'type';
import { Link } from 'gatsby';
import './Post.scss';

interface IProps {
  post: IMarkdownRemark;
}

class Post extends Component<IProps> {
  render() {
    const { post } = this.props;
    const title = post.frontmatter.title || post.fields.slug;
    return (
      <div id="post" className="has-text-grey-dark">
        <div className="has-text-weight-semibold is-size-4 is-size-5-mobile">
          {title}
        </div>
        <div className="is-uppercase is-size-7 is-size-7-mobile">
          {post.frontmatter.date}
        </div>
        <div className="summary is-size-6 is-size-6-mobile">
          {post.frontmatter.description}}
        </div>
        <div className="tags">
          {post.frontmatter.tags.map(tag => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    );
  }
}

export default Post;
