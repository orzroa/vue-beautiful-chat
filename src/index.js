import Launcher from './Launcher.vue'
import FloatingVue from 'floating-vue'
import mitt from 'mitt'

const defaultComponentName = 'BeautifulChat'

const Plugin = {
  install(app, options = {}) {
    /**
     * Makes sure that plugin can be installed only once
     */
    if (this.installed) {
      return
    }

    this.installed = true
    this.eventBus = mitt()
    this.dynamicContainer = null
    this.componentName = options.componentName || defaultComponentName

    /**
     * Plugin API
     */
    app.config.globalProperties.$chat = {
      _setDynamicContainer(dynamicContainer) {
        Plugin.dynamicContainer = dynamicContainer
      }
    }

    /**
     * Provide event bus for components
     */
    app.provide('eventBus', this.eventBus)

    /**
     * Sets custom component name (if provided)
     */
    app.component(this.componentName, Launcher)
    app.use(FloatingVue)

    /**
     * Compatibility layer for components using $emit/$on
     * Use $chatEmit/$chatOn/$chatOff to avoid conflict with Vue 3 instance methods
     */
    app.config.globalProperties.$chatEmit = (event, ...args) => {
      this.eventBus.emit(event, ...args)
    }
    app.config.globalProperties.$chatOn = (event, handler) => {
      this.eventBus.on(event, handler)
    }
    app.config.globalProperties.$chatOff = (event, handler) => {
      this.eventBus.off(event, handler)
    }
  }
}

export default Plugin
