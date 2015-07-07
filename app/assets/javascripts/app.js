const Cycle = require('@cycle/core');
const CycleWeb = require('@cycle/web');
const h = CycleWeb.h;

function createPost (ev) {
  if (ev.content !== undefined) {
    return ev;
  }

  return {
    title: ev.target[0].value,
    content: ev.target[1].value
  }
};

function intent (DOM) {
  return {
    post$: DOM.get('.create-post', 'submit')
      .startWith({title: 'test', content: 'hello world'})
      .map(createPost)
  };
}

function model ({post$}) {
  return post$;
}

function createPostForm () {
  return h('form.create-post', {action: '#'}, [
           'Create new post',
           h('input'),
           h('textarea', {type: 'textarea'}),
           h('input', {type: 'submit'})
         ])
}
function renderPost (post) {
  return h('div', [
           h('h3', post.title),
           h('p', post.content)
         ]);
}

function renderPosts (posts) {
  return posts.map(renderPost);
}

function view (post$) {
  return post$.map(post =>
    h('div', [
      h('h3', 'Posts'),
      createPostForm(),
      renderPosts([post])
    ])
  );
}

function main ({DOM}) {
  return {DOM: view(model(intent(DOM)))};
}

window.startApp = (mountNodeId) => {
  Cycle.run(main, {
    DOM: CycleWeb.makeDOMDriver(mountNodeId)
  });
};
