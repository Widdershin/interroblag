/* globals React */
/* @flow */

var Post = React.createClass({
  propTypes: {
    post: React.PropTypes.shape({
      title: React.PropTypes.string,
      content: React.PropTypes.string,
      x: React.PropTypes.number,
      y: React.PropTypes.number
    })
  },

  render: function() {
    return (
      <div className='post'>
        <div>Title: {this.props.post.title}</div>
        <div>Content: {this.props.post.content}</div>
      </div>
    );
  }
});
