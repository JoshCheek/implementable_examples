class React {
}

React.createElement = function(klass, props, ...children) {
  const dom = {klass, props, children}

  if (typeof klass === 'string') {
    dom.type = 'concrete'
  } else {
    dom.type = 'virtual'
  }

  return dom
}

React.Component = class Component {
  constructor(props, context, updater) {
    this.props   = props
    this.context = context
    this.updater = updater
  }

  setState(newState){
    Object.assign(this.state, newState)
    this.updater()
  }
}

function isReactComponent(virtualNode){
  return React.Component.isPrototypeOf(virtualNode);
};


window.ReactDOM = {
  render(virtualNode, parent) {
    if(!virtualNode)
      return

    if (typeof virtualNode === 'string')
      return parent.appendChild(document.createTextNode(virtualNode))

    if (Array.isArray(virtualNode))
      return virtualNode.map(
        child => ReactDOM.render(child, parent))

    let {type, klass, props, children} = virtualNode
    const grandChildren = children // ;)~
    props = props || {}
    let nextVirtualNode;

    if(type === 'concrete') {
      const child = document.createElement(klass)

      if(props.className)
        child.classList.add(props.className)

      if(props.onClick)
        child.addEventListener('click', props.onClick);

      if(grandChildren.length !== 0)
        grandChildren.forEach(grandChild =>
          ReactDOM.render(grandChild, child))
      parent.appendChild(child)
      return child
    }

    if(isReactComponent(klass)) {
      let domNode

      function updater() {
        const maybeNewVdom = this.render()
        ReactDOM.render(maybeNewVdom, parent)
        // const diff = getDiff(nextVirtualNode, maybeNewVdom)
        // applyDiff(diff, domnode)
      }
      nextVirtualNode = new klass(props, {}, updater).render()
      domNode = ReactDOM.render(nextVirtualNode, parent)
      return domNode
    }

    if (typeof klass === 'function') {
      nextVirtualNode = klass(props);
      return ReactDOM.render(nextVirtualNode, parent)
    }

    console.dir(virtualNode)
    throw new Error("Shouldn't get here!")
  }
}

window.React = React
