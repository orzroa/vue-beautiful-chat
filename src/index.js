import Launcher from './Launcher.vue'
import VTooltip from 'floating-vue'
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
    app.use(VTooltip)

    /**
     * Compatibility layer for components using $emit/$on
     */
    app.config.globalProperties.$emit = (event, ...args) => {
      this.eventBus.emit(event, ...args)
    }
    app.config.globalProperties.$on = (event, handler) => {
      this.eventBus.on(event, handler)
    }
    app.config.globalProperties.$off = (event, handler) => {
      this.eventBus.off(event, handler)
    }
  }
}

export default Plugin
