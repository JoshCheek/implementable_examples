class React {
  constructor() {
    throw('INVOKED REACT!')
  }
}

class Component {
  constructor(props) {
    this.props = props
  }
}

React.Component = Component


React.createElement = function(toCreate, attrs, ...children) {
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
  const renderNothing = (toRender, parent, root) =>
    null

  const renderText = ({text}, parent, root) => {
    const element = document.createTextNode(text)
    parent.appendChild(element)
    return element
  }

  const renderArray = ({array}, parent, root) => {
    array.forEach(element => ReactDOM.render(element, parent, root))
    return parent
  }

  const renderComponent = ({componentClass, attributes, children}, parent, root) =>
    ReactDOM.render(new componentClass(attributes).render(), parent, root)

  const renderFunction = ({fn, attributes, children}, parent, root) =>
    ReactDOM.render(fn(attributes), parent, root)

  const renderVirtualNode = ({nodeName, attributes, children}, parent, root) => {
    const element  = document.createElement(nodeName)
    for(let attrName in attributes)
      if(attrName === 'className')
        element.classList.add(attributes[attrName])
      else
        element.setAttribute(attrName, attributes[attrName])
    children.forEach(child => ReactDOM.render(child, element, 'FIXME'))
    parent.appendChild(element)
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
      'array':       renderArray,
      'component':   renderComponent,
      'function':    renderFunction,
      'virtualNode': renderVirtualNode,
      'default':     renderError,
    })[toRender.type](toRender, parent, root)
  }

  return {render}
})()
