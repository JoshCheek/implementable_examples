class React {
  constructor() {
    throw('INVOKED REACT!')
  }
}

class Component {
  constructor(props) {
    this.props = props
    // debugger
    // console.log('Component:', this)
    // console.log('Component props', props)
  }
}


React.createElement = function(toCreate, attrs, ...children) {
  console.log('CHILDREN')
  console.log(children)
  // console.log('CREATING', toCreate, attrs, children)
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

React.Component = Component

const ReactDOM = {
  render: (toRender, parent, root) => {
    if(toRender === null) {
      // nothing to render
      return null

    } else if(typeof toRender === 'string') {
      // text
      const element = document.createTextNode(toRender)
      parent.appendChild(element)
      return element

    } else if(typeof toRender === 'object' && toRender.constructor === Array) {
      // array
      toRender.forEach(element => ReactDOM.render(element, parent, root))
      return parent

    } else if(toRender.type === 'component') {
      const {componentClass, attributes, children} = toRender
      // console.log('RENDERING component', componentClass, attributes, children)
      const component = new componentClass(attributes)
      const child     = component.render()
      return ReactDOM.render(child, parent, root)

    } else if(toRender.type === 'function') {
      const {fn, attributes, children} = toRender
      // console.log('RENDERING function', fn, attributes, children)
      return ReactDOM.render(fn(attributes), parent, root)

    } else if(toRender.type === 'virtualNode') {
      const {nodeName, attributes, children} = toRender
      // console.log('virtualNode', nodeName, attributes, children)
      const element  = document.createElement(nodeName)
      for(let attrName in attributes) {
        if(attrName === 'className') {
          element.classList.add(attributes[attrName])
        } else {
          element.setAttribute(attrName, attributes[attrName])
        }
      }
      children.forEach(child => ReactDOM.render(child, element, 'FIXME'))
      parent.appendChild(element)
      return element
    } else {
      window.errObj = toRender
      throw(`IDK HOW TO RENDER ${toRender}`)
    }
  }
}
