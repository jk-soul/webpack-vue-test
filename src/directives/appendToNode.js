class AppendToNode {
  constructor (el, value) {
    this.privateClassName = 'v-append-to-node'
    this.el = el
    if (!el || !el.parentNode) return
    this.parentNode = el.parentNode
    this.comment = null
    this.target = null
    // 是否被append操作过
    this.hasAppend = false
    this.append(value)
  }
  // node name or node instance or undefind
  getNewNode (node) {
    if (node) {
      return node instanceof window.Node ? node : document.querySelector(node)
    }
    return document.body
  }
  addClass () {
    let className = this.el.className || this.privateClassName
    let reg = new RegExp(this.className)
    if (!reg.test(reg)) {
      className += this.className
    }
    this.el.className = className
  }
  removeClass () {
    let className = this.el.className
    if (className) {
      className.replace(this.privateClassName, '')
    }
    this.el.className = className
  }
  append (value) {
    if (this.hasAppend) {
      // 已存在append操作
      if (value === false) {
        // replace
        this.parentNode.replaceChild(this.el, this.comment)
      } else {
        // append
        this.target = this.getNewNode(value)
        if (!this.target) return
        this.target.appendChild(this.el)
      }
    } else {
      // 未存在append操作
      if (value === false) {
        // none
      } else {
        // first append
        this.comment = document.createComment('')
        // this.parentNode.appendChild(this.comment)
        this.parentNode.replaceChild(this.comment, this.el)
        this.target = this.getNewNode(value)
        if (!this.target) return
        this.target.appendChild(this.el)
        this.addClass()
        this.hasAppend = true
      }
    }
  }
  recover () {
    if (this.hasAppend) {
      this.parentNode.appendChild(this.el)
      this.removeClass()
    }
  }
}

// append to body, default body
const appendToNode = {
  inserted (el, { value }, vnode) {
    let instance = new AppendToNode(el, value)
    el.appendToNodeInstance = instance
  },
  componentUpdated (el, { value }) {
    const instance = el.appendToNodeInstance
    if (!instance || !instance.append) return
    instance.append(value)
  },
  unbind (el) {
    // v-if 高于其他 directive， 此dom操作无需执行
    // let instance = el.appendToNodeInstance
    // if (!instance || !instance.recover) return
    // console.log(el)
    // instance.recover()
    // delete el.appendToNodeInstance
  }
}

export {
  appendToNode
}
