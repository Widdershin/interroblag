/* global $ */
const Cycle = require('@cycle/core');
const {makeDOMDriver, h, svg} = require('@cycle/web');

function getValue (form, fieldClass) {
  return $(form).find(fieldClass).val();
}

function createPost (ev) {
  return {
    title: getValue(ev.target, '.title'),
    content: getValue(ev.target, '.content')
  };
};

function intent (DOM) {
  return DOM.get('.create-post', 'submit').map(createPost);
}

function model (post$) {
  return post$.startWith([]).scan((posts, post) => posts.concat([post]));
}

function renderCreatePostForm () {
  return (
    h('form.create-post', {action: '#'}, [
     'Create new post',
     h('input.title'),
     h('textarea.content', {type: 'textarea'}),
     h('input', {type: 'submit'})
   ])
  );
}

function renderPost (post) {
  return (
    h('div.post', [
     h('h3.title', post.title),
     h('p.content', post.content)
   ])
  );
}

function renderSvgPost (post, width = 300, height = 200) {
  return (
    svg('g.post-container', {x: 50, y: 10, width: 300, height: 200, stroke: 'black', fill: 'white', 'stroke-width': '1px'}, [
      svg('rect', {width: 300, height: 200}),
      svg('foreignObject', {width: 300, height: 200}, [
        renderPost(post)
      ])
    ])
  );
}

function renderPosts (posts) {
  return posts.map(renderSvgPost);
}

function renderBlogboard (posts) {
  return svg('svg', {width: 800, height: 600}, renderPosts(posts));
}

function view (post$) {
  return post$.map(posts =>
    h('div', [
      h('h3', 'Posts'),
      renderCreatePostForm(),
      renderBlogboard(posts)
    ])
  );
}

function main ({DOM}) {
  return {
    DOM: view(model(intent(DOM)))
  };
}

window.startApp = (mountNodeId) => {
  Cycle.run(main, {
    DOM: makeDOMDriver(mountNodeId)
  });
};
