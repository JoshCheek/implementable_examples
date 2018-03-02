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

    if (typeof virtualNode === 'string') {
      const nextVirtualNode = document.createTextNode(virtualNode)
      parent.appendChild(nextVirtualNode)
      return
    }

    if (Array.isArray(virtualNode)) {
      virtualNode.forEach(child =>
        ReactDOM.render(child, parent))
      return
    }

    let {type, klass, props, children} = virtualNode
    const grandChildren = children // ;)~
    props = props || {}
    let nextVirtualNode;

    if(type === 'concrete') {
      const child = document.createElement(klass)

      // console.log(props)

      if(props.className) {
        child.classList.add(props.className)
      }

      if(props.onClick) {
        child.addEventListener('click', () => {
          console.log("PROPS:", props.onClick.toString())
          props.onClick();
        });

      }

      if(grandChildren.length !== 0)
        grandChildren.forEach(grandChild =>
          ReactDOM.render(grandChild, child))
      parent.appendChild(child)
      return
    }

    if(isReactComponent(klass)) {
      function updater() {
        ReactDOM.render(this.render(), parent)
      }
      nextVirtualNode = new klass(props, {}, updater).render()
      ReactDOM.render(nextVirtualNode, parent)
      return
    }

    if (typeof klass === 'function') {
      nextVirtualNode = klass(props);
      ReactDOM.render(nextVirtualNode, parent)
      return
    }

    console.dir(virtualNode)
    throw new Error("Shouldn't get here!")
  }
}

window.React = React
