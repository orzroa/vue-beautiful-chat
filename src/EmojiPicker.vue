<template>
  <div ref="domNode" tabIndex="0" class="sc-emoji-picker" @blur="onBlur">
    <div class="sc-emoji-picker--content">
      <div v-for="category in emojiData" :key="category.name" class="sc-emoji-picker--category">
        <div class="sc-emoji-picker--category-title">{{ category.name }}</div>
        <span
          v-for="emoji in category.emojis"
          :key="emoji"
          class="sc-emoji-picker--emoji"
          @click="emojiClicked(emoji)"
        >
          {{ emoji }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import EmojiConvertor from 'emoji-js'
import emojiData from './emojiData'

const props = defineProps({
  onBlur: {
    type: Function,
    required: true
  },
  onEmojiPicked: {
    type: Function,
    required: true
  }
})

const domNode = ref(null)
const emojiDataRef = emojiData
const emojiConvertor = new EmojiConvertor()

onMounted(() => {
  const elem = domNode.value
  elem.style.opacity = 0
  window.requestAnimationFrame(() => {
    elem.style.transition = 'opacity 350ms'
    elem.style.opacity = 1
  })
  domNode.value.focus()
  emojiConvertor.init_env()
})

const emojiClicked = (emoji) => {
  props.onEmojiPicked(emoji)
  domNode.value.blur()
}
</script>

<style scoped>
.sc-emoji-picker {
  position: absolute;
  bottom: 50px;
  right: 12px;
  width: 330px;
  max-height: 215px;
  box-shadow: 0px 7px 40px 2px rgba(148, 149, 150, 0.3);
  background: white;
  border-radius: 10px;
  outline: none;
}

.sc-emoji-picker:after {
  content: '';
  width: 14px;
  height: 14px;
  background: white;
  position: absolute;
  bottom: -6px;
  right: 55px;
  transform: rotate(45deg);
  border-radius: 2px;
}

.sc-emoji-picker--content {
  padding: 10px;
  overflow: auto;
  width: 100%;
  max-height: 195px;
  margin-top: 7px;
  box-sizing: border-box;
}

.sc-emoji-picker--category {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.sc-emoji-picker--category-title {
  min-width: 100%;
  color: #b8c3ca;
  font-size: 13px;
  margin: 5px;
  letter-spacing: 1px;
}

.sc-emoji-picker--emoji {
  margin: 5px;
  width: 30px;
  line-height: 30px;
  text-align: center;
  cursor: pointer;
  vertical-align: middle;
  font-size: 28px;
  transition: transform 60ms ease-out;
}

.sc-emoji-picker--emoji:hover {
  transform: scale(1.4);
}
</style>
