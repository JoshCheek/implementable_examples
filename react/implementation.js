class React {
  constructor() {
    throw('INVOKED REACT!')
  }
}

class Component {
  constructor(props) {
    this.props = props
  }

  render() {
  }

  setState(state) {
    const setter = () => {
      for(let key in state)
        this.state[key] = state[key]
      const toRender = this.render()
      this.root = ReactDOM.render(toRender, this.domParent, this.root)
    }
    setTimeout(setter, 0)
  }
}

React.Component = Component


const flatten = function(toFlatten, flattened=[]) {
  if(!toFlatten.length)
    return flattened
  const [element, ...rest] = toFlatten
  if(element && element.constructor === Array)
    flattened = flatten(element, flattened)
  else
    flattened = flattened.concat([element])
  return flatten(rest, flattened)
}

React.createElement = function(toCreate, attrs, ...children) {
  children = flatten(children)
  if(typeof toCreate === 'string') {
    return {
      type:       'virtualNode',
      nodeName:   toCreate,
      attributes: attrs,
      children:   children,
    }
  } else if(typeof toCreate === 'function' && toCreate.prototype && toCreate.prototype.render) {
    return {
      type:           'component',
      componentClass: toCreate,
      attributes:     attrs,
      children:       children,
    }
  } else {
    return {
      type:       'function',
      fn:         toCreate,
      attributes: attrs,
      children:   children,
    }
  }
}


const ReactDOM = (() => {
  const renderNothing = (toRender, parent, root) => {
    if(root)
      root.parentElement.removeChild(root)
    return null
  }

  const renderText = ({text}, parent, root) => {
    let element
    if(root) {
      element = root
      element.nodeValue = text
    } else {
      element = document.createTextNode(text)
      parent.appendChild(element)
    }
    return element
  }

  const renderComponent = ({componentClass, attributes, children}, parent, root) => {
    const component     = new componentClass(attributes, parent, root)
    const nextRoot      = ReactDOM.render(component.render(), parent, root)
    component.domParent = parent
    component.root      = nextRoot
    return nextRoot
  }

  const renderFunction = ({fn, attributes, children}, parent, root) =>
    ReactDOM.render(fn(attributes), parent, root)

  const renderVirtualNode = ({nodeName, attributes, children}, parent, root) => {
    let element
    if(root) {
      element = root
      for(let attrName in attributes)
        if(attrName === 'className')
          element.classList.add(attributes[attrName])
        else if(attrName === 'onClick')
          null // FIXME: This only works for our specific example (I hope :P)
        else
          element.setAttribute(attrName, attributes[attrName])
      const childNodes = element.childNodes
      children.forEach((child, i) => ReactDOM.render(child, element, childNodes[i]))
      // for(let i = children.length; i < childNodes.length; ++i) {
      //   const child = childNodes[i]
      //   child.parentElement.removeChild(child)
      // }
    } else {
      element = document.createElement(nodeName)
      for(let attrName in attributes)
        if(attrName === 'className')
          element.classList.add(attributes[attrName])
        else if(attrName === 'onClick')
          element.addEventListener('click', attributes[attrName], false)
        else
          element.setAttribute(attrName, attributes[attrName])
      children.forEach(child => ReactDOM.render(child, element, null))
      parent.appendChild(element)
    }
    return element
  }

  const renderError = ({toRender}, parent, root) => {
    window.errObj = toRender
    throw(`IDK HOW TO RENDER ${toRender}`)
  }

  const normalize = (toRender, parent, root) => {
    if(toRender === null)
      return {type: 'nothing'}
    if(typeof toRender === 'string')
      return {type: 'text', text: toRender}
    if(typeof toRender !== 'object')
      return {type: 'error', toRender: toRender}
    if(toRender.constructor === Array)
      return {type: 'array', array: toRender}
    if (toRender.type)
      return toRender
    return {type: 'error', toRender: toRender}
  }

  const render = (toRender, parent, root) => {
    toRender = normalize(toRender)
    return ({
      'nothing':     renderNothing,
      'text':        renderText,
      'component':   renderComponent,
      'function':    renderFunction,
      'virtualNode': renderVirtualNode,
      'default':     renderError,
    })[toRender.type](toRender, parent, root)
  }

  return {render}
})()
