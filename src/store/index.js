/*
 * Use store pattern instead of Vuex since this is a plugin
 * and instantiated externally
 **/

import { reactive } from 'vue'

const store = reactive({
  editMessage: null
})

function setState(key, val) {
  store[key] = val
}

function mapState(keys) {
  const map = {}
  keys.forEach((key) => {
    map[key] = function () {
      return store[key]
    }
  })
  return map
}

export default store
export { mapState, setState }
