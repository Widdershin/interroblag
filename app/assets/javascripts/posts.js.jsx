var React = require('react');

$(() => {
  React.render(
    <Blog posts={window.posts} />,
    document.getElementById('blog')
  )
});

