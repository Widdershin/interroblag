var Blog = React.createClass({
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
