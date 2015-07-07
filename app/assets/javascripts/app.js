const Cycle = require('@cycle/core');
const CycleWeb = require('@cycle/web');
const h = CycleWeb.h;

function intent (DOM) {
  return Cycle.Rx.Observable.just({title: 'Test', content: 'Hello World'});
}

function model (post$) {
  return post$;
}

function view (post$) {
  return post$.map(post =>
    h('div', [
      h('h3', post.title),
      h('p', post.content)
    ])
  )
}

function main ({DOM}) {
  return {DOM: view(model(intent(DOM)))};
}

window.startApp = (mountNodeId) => {
  Cycle.run(main, {
    DOM: CycleWeb.makeDOMDriver(mountNodeId)
  });
}
