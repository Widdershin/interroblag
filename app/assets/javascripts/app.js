/* global $ */
const Cycle = require('@cycle/core');
const {makeDOMDriver, h, svg} = require('@cycle/web');

function log (thing) {
  console.log(thing);

  return thing;
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
    id: 1 // TODO - implement id,
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

function intent (DOM) {
  return {
    dragPost$: DOM.get('.post-container', 'mousedown').map(ev => getId(ev.target)),
    releaseDrag$: DOM.get('.app', 'mouseup').map(ev => null),
    mouseMove$: DOM.get('.app', 'mousemove').map(getMousePosition).startWith({x: 0, y: 0}),

    post$: DOM.get('.create-post', 'submit').map(createPost)
  };
}

function model ({dragPost$, releaseDrag$, post$, mouseMove$}) {
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

  const currentPost$ = post$
    .startWith([{title: 'Test Post', content: 'Please ignore', id: 1, dragged: false, x: 300, y: 200}])
    .scan((posts, post) => posts.concat([post]));

  function getPostPosition (positions, post) {
    if (positions[post.id] !== undefined) {
      return positions[post.id];
    } else {
      return {x: 300, y: 200};
    }
  }

  return Cycle.Rx.Observable.combineLatest(
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
  );
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
  return svg('svg', {width: 800, height: 600}, renderPosts(posts));
}

function view (post$) {
  return post$.map(posts =>
    h('div.app', [
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
