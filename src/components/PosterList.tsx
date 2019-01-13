import React from 'react';
import { Link } from 'gatsby';
import { IPageProps } from '../common';
import { INode } from 'type';
import Post from 'components/Post';

export interface IProps {
  posts: INode[];
}

class PosterList extends React.Component<IProps> {
  render() {
    const { posts } = this.props;

    return (
      <>
        {posts.map(({ node }) => {
          return (
            <div className="postItem" key={node.fields.slug}>
              <Link className="postLink" to={node.fields.slug}>
                <Post post={node} />
              </Link>
            </div>
          );
        })}
      </>
    );
  }
}

export default PosterList;
