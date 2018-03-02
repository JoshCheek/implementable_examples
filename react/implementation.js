class React {
}

React.createElement = function(klass, props, children) {
  const dom = {klass, props, children}

  if (typeof klass === 'string') {
    dom.type = 'concrete'
  } else {
    dom.type = 'virtual'
  }

  return dom
}

React.Component = class Component {
  constructor(props, context) {
    this.props = props
  }
}

function isReactComponent(virtualNode){
  return React.Component.isPrototypeOf(virtualNode);
};


window.ReactDOM = {
  render(virtualNode, parent) {
    console.log(virtualNode)
    const {type, klass, props, children} = virtualNode
    const grandChildren = children // ;)~

    if(type === 'concrete') {
      const child = document.createElement(klass)
      if(grandChildren)
        ReactDOM.render(grandChildren, child)
      parent.appendChild(child)
    } else {

      let nextVirtualNode;
      if(isReactComponent(klass)){
        nextVirtualNode = new klass(props, {}).render()
      } else {
        nextVirtualNode = klass(props);
      }

      ReactDOM.render(nextVirtualNode, parent)
    }
  }
}

window.React = React
