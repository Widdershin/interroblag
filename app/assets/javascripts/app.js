/* global $ */
const Cycle = require('@cycle/core');
const CycleWeb = require('@cycle/web');
const h = CycleWeb.h;

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
    h('div', [
     h('h3', post.title),
     h('p', post.content)
   ])
  );
}

function renderPosts (posts) {
  return posts.map(renderPost);
}

function view (post$) {
  return post$.map(posts =>
    h('div', [
      h('h3', 'Posts'),
      renderCreatePostForm(),
      renderPosts(posts)
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
    DOM: CycleWeb.makeDOMDriver(mountNodeId)
  });
};
