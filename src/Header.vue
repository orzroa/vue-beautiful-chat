<template>
  <div class="sc-header" :style="{background: colors.header.bg, color: colors.header.text}">
    <slot>
      <img v-if="titleImageUrl" class="sc-header--img" :src="titleImageUrl" alt="" />
      <div v-if="!disableUserListToggle" class="sc-header--title enabled" @click="toggleUserList">
        {{ title }}
      </div>
      <div v-else class="sc-header--title">{{ title }}</div>
    </slot>
    <div v-if="showCloseButton" class="sc-header--close-button" @click="$emit('close')">
      <img :src="icons.close.img" :alt="icons.close.name" />
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'
import {mapState} from './store/'
import CloseIcon from './assets/close-icon-big.png'
import store from './store/'

defineOptions({
  name: 'ChatHeader'
})

const props = defineProps({
  icons: {
    type: Object,
    default: function () {
      return {
        close: {
          img: CloseIcon,
          name: 'default'
        }
      }
    }
  },
  title: {
    type: String,
    required: true
  },
  colors: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'userList'])

const inUserList = ref(false)

const disableUserListToggle = computed(() => store.disableUserListToggle)
const titleImageUrl = computed(() => store.titleImageUrl)
const showCloseButton = computed(() => store.showCloseButton)

const toggleUserList = () => {
  inUserList.value = !inUserList.value
  emit('userList', inUserList.value)
}
</script>

<style scoped>
.sc-header {
  min-height: 75px;
  border-top-left-radius: 9px;
  border-top-right-radius: 9px;
  padding: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  box-sizing: border-box;
  display: flex;
}

.sc-header--img {
  border-radius: 50%;
  align-self: center;
  padding: 10px;
}

.sc-header--title {
  align-self: center;
  padding: 10px;
  flex: 1;
  user-select: none;
  font-size: 20px;
}

.sc-header--title.enabled {
  cursor: pointer;
  border-radius: 5px;
}

.sc-header--title.enabled:hover {
  box-shadow: 0px 2px 5px rgba(0.2, 0.2, 0.5, 0.1);
}

.sc-header--close-button {
  width: 40px;
  align-self: center;
  height: 40px;
  margin-right: 10px;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: 5px;
  margin-left: auto;
}

.sc-header--close-button:hover {
  box-shadow: 0px 2px 5px rgba(0.2, 0.2, 0.5, 0.1);
}

.sc-header--close-button img {
  width: 100%;
  height: 100%;
  padding: 13px;
  box-sizing: border-box;
}

@media (max-width: 450px) {
  .sc-header {
    border-radius: 0px;
  }
}
</style>
