/* @flow */

var React = require('react');
var Draggable = require('react-draggable');

Post = React.createClass({
  propTypes: {
    post: React.PropTypes.shape({
      title: React.PropTypes.string,
      content: React.PropTypes.string,
      x: React.PropTypes.number,
      y: React.PropTypes.number
    })
  },

  render: function () {
    return (
      <Draggable>
        <div className='post'>
          <div>Title: {this.props.post.title}</div>
          <div>Content: {this.props.post.content}</div>
        </div>
      </Draggable>
    );
  }
});

module.exports = Post;
