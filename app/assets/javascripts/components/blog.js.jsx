/* global Post */
/* @flow */

var React = require('react');

window.Blog = React.createClass({
  propTypes: {
    posts: React.PropTypes.array
  },

  render: function() {
    return (
      <div>
       {this.props.posts.map(post => <Post post={post} />)}
      </div>
    );
  }
});
