/* global $ */
const Cycle = require('@cycle/core');
const {makeDOMDriver, h, svg} = require('@cycle/dom');
const {makeHTTPDriver} = require('@cycle/http');

const uuid = require('uuid');

function log (label) {
  return function (thing) {
    console.log(label, thing);

    return thing;
  }
}

function getValue (form, fieldClass) {
  return $(form).find(fieldClass).val();
}

function createPost (ev) {
  return {
    title: getValue(ev.target, '.title'),
    content: getValue(ev.target, '.content'),
    dragged: false,
    x: 10,
    y: 10,
    id: uuid.v4()
  };
};

function getId (container) {
  return $(container).closest('.post-container').find('.post').data('id');
}

function getMousePosition (ev) {
  var svg = document.querySelector('svg'); // TODO - this is laughably bad
  var pt = svg.createSVGPoint();
  pt.x = ev.clientX + document.body.scrollLeft;
  pt.y = ev.clientY + document.body.scrollTop;

  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function intent ({DOM, HTTP}) {
  return {
    dragPost$: DOM.get('.post-container', 'mousedown').map(ev => getId(ev.target)),
    releaseDrag$: DOM.get('.app', 'mouseup').map(ev => null),
    mouseMove$: DOM.get('.app', 'mousemove').map(getMousePosition).startWith({x: 0, y: 0}),

    createPost$: DOM.get('.create-post', 'submit').map(createPost),
    httpResponse$: HTTP
  };
}

function fetchServerPosts () {
  return {
    url: '/posts',
    accept: 'application/json'
  };
}

function updateServer (posts) {
  posts.forEach(post => {
    $.ajax({
      url: `/posts/${post.id}`,
      data: {_method: 'PUT', post},
      method: 'POST'
    });
  });
}

function model ({dragPost$, releaseDrag$, createPost$, mouseMove$, httpResponse$}) {
  const draggedPost$ = Cycle.Rx.Observable.merge(
    dragPost$,
    releaseDrag$
  ).startWith(null);

  const postPosition$ = Cycle.Rx.Observable.combineLatest(draggedPost$, mouseMove$, (latestDraggedPost, mousePosition) => {
    return {latestDraggedPost, mousePosition};
  }).startWith({}).scan((postPositions, {latestDraggedPost, mousePosition}) => {
    if (latestDraggedPost === null) {
      const lastDraggedPost = postPositions.draggedPost;
      return Object.assign(postPositions, {
        draggedPost: null,
        [lastDraggedPost]: mousePosition
      });
    }

    return Object.assign(postPositions, {
      draggedPost: latestDraggedPost,
      [latestDraggedPost]: mousePosition
    });
  });

  const fetchServerPost$ = Cycle.Rx.Observable.interval(5000)
    .startWith('go!')
    .map(fetchServerPosts);

  const serverPost$ = httpResponse$
    .filter(e => e.request.url === '/posts')
    .mergeAll()
    .map(response => JSON.parse(response.text))
    .map(log('serverPosts'));

  const currentPost$ = Cycle.Rx.Observable.merge(
      createPost$.map(post => [post]),
      serverPost$.distinctUntilChanged()
   ).startWith([])
    .scan((posts, newPosts) => posts.concat(newPosts));

  function getPostPosition (positions, post) {
    if (positions[post.id] !== undefined) {
      return positions[post.id];
    } else {
      return {x: post.x, y: post.y};
    }
  }

  const postWithPosition$ = Cycle.Rx.Observable.combineLatest(
    postPosition$,
    currentPost$,
    (postPositions, posts) => {
      return posts.map(post => {
        return {
          title: post.title,
          content: post.content,
          id: post.id,
          dragged: postPositions.draggedPost === post.id,
          x: getPostPosition(postPositions, post).x,
          y: getPostPosition(postPositions, post).y,
        }
      });
    }
  ).distinctUntilChanged().map(log('posts'));

  postWithPosition$.sample(Cycle.Rx.Observable.interval(2000))
    .forEach(updateServer);

  const httpRequest$ = fetchServerPost$;

  return {post$: postWithPosition$, httpRequest$};
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
    h('div.post', {attributes: {'data-id': post.id}}, [
      h('h3.title', post.title),
      h('p.content', post.content),
      h('p', "Dragged " + post.dragged)
    ])
  );
}

function renderSvgPost (post, {width = 300, height = 200}) {
  let position = {
    x: post.x - width / 2,
    y: post.y - height / 2
  };

  return (
    svg('g', {'class': 'post-container draggable', x: position.x, y: position.y, width: width, height: height, stroke: 'black', fill: 'white', 'stroke-width': '1px'}, [
      svg('rect', {x: position.x, y: position.y, width: width, height: height}), // it feels like I shouldn't have to do this much typing
      svg('foreignObject', {x: position.x, y: position.y, width: width, height: height}, [
        renderPost(post)
      ])
    ])
  );
}

function renderPosts (posts) {
  return posts.map(renderSvgPost);
}

function renderBlogboard (posts) {
  return svg('svg', {width: '100%', height: '600px'}, renderPosts(posts));
}

function view ({post$, httpRequest$}) {
  return {
    DOM: post$.map(posts =>
      h('div.app', [
        h('h3', 'Posts'),
        renderCreatePostForm(),
        renderBlogboard(posts)
      ])
    ),

    HTTP: httpRequest$
  };
}

function main (responses) {
  return view(model(intent(responses)));
}

window.startApp = (mountNodeId) => {
  Cycle.run(main, {
    DOM: makeDOMDriver(mountNodeId),
    HTTP: makeHTTPDriver()
  });
};
