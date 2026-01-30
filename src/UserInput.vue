<template>
  <div>
    <Suggestions :suggestions="suggestions" :colors="colors" @send-suggestion="_submitSuggestion" />
    <div
      v-if="file"
      class="file-container"
      :style="{
        backgroundColor: colors.userInput.text,
        color: colors.userInput.bg
      }"
    >
      <span class="icon-file-message"
        ><img :src="icons.file.img" :alt="icons.file.name" height="15"
      /></span>
      {{ file.name }}
      <span class="delete-file-message" @click="cancelFile()"
        ><img
          :src="icons.closeSvg.img"
          :alt="icons.closeSvg.name"
          height="10"
          title="Remove the file"
      /></span>
    </div>
    <form
      class="sc-user-input"
      :class="{active: inputActive}"
      :style="{background: colors.userInput.bg}"
    >
      <div
        ref="userInput"
        role="button"
        tabIndex="0"
        contentEditable="true"
        :placeholder="placeholder"
        class="sc-user-input--text"
        :style="{color: colors.userInput.text}"
        @focus="setInputActive(true)"
        @blur="setInputActive(false)"
        @keydown="handleKey"
        @focusUserInput="focusUserInput()"
      ></div>
      <div class="sc-user-input--buttons">
        <div v-if="showEmoji && !isEditing" class="sc-user-input--button">
          <EmojiIcon :on-emoji-picked="_handleEmojiPicked" :color="colors.userInput.text" />
        </div>
        <div v-if="showFile && !isEditing" class="sc-user-input--button">
          <FileIcons :on-change="_handleFileSubmit" :color="colors.userInput.text" />
        </div>
        <div v-if="isEditing" class="sc-user-input--button">
          <UserInputButton
            :color="colors.userInput.text"
            tooltip="Cancel"
            @click.prevent="_editFinish"
          >
            <IconCross />
          </UserInputButton>
        </div>
        <div class="sc-user-input--button">
          <UserInputButton
            v-if="isEditing"
            :color="colors.userInput.text"
            tooltip="Edit"
            @click.prevent="_editText"
          >
            <IconOk />
          </UserInputButton>
          <UserInputButton
            v-else
            :color="colors.userInput.text"
            tooltip="Send"
            @click.prevent="_submitText"
          >
            <IconSend />
          </UserInputButton>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import {ref, computed, watch, onMounted, onBeforeUnmount, nextTick} from 'vue'
import EmojiIcon from './icons/EmojiIcon.vue'
import FileIcons from './icons/FileIcons.vue'
import UserInputButton from './UserInputButton.vue'
import Suggestions from './Suggestions.vue'
import FileIcon from './assets/file.svg'
import CloseIconSvg from './assets/close.svg'
import store from './store/'
import IconCross from './components/icons/IconCross.vue'
import IconOk from './components/icons/IconOk.vue'
import IconSend from './components/icons/IconSend.vue'

const props = defineProps({
  icons: {
    type: Object,
    default: function () {
      return {
        file: {
          img: FileIcon,
          name: 'default'
        },
        closeSvg: {
          img: CloseIconSvg,
          name: 'default'
        }
      }
    }
  },
  showEmoji: {
    type: Boolean,
    default: () => false
  },
  suggestions: {
    type: Array,
    default: () => []
  },
  showFile: {
    type: Boolean,
    default: () => false
  },
  onSubmit: {
    type: Function,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Write something...'
  },
  colors: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['onType', 'edit'])

const file = ref(null)
const inputActive = ref(false)
const userInput = ref(null)

const editMessageId = computed(() => {
  return isEditing.value && store.editMessage.id
})

const isEditing = computed(() => {
  return store.editMessage && store.editMessage.id
})

const enterToSend = computed(() => store.enterToSend)

watch(editMessageId, (m) => {
  if (store.editMessage != null && store.editMessage != undefined) {
    userInput.value.focus()
    userInput.value.textContent = store.editMessage.data.text
  } else {
    userInput.value.textContent = ''
  }
})

const cancelFile = () => {
  file.value = null
}

const setInputActive = (onoff) => {
  inputActive.value = onoff
}

const wantToSend = (event) => {
  if (enterToSend.value) {
    return event.keyCode === 13 && !event.shiftKey
  } else {
    return event.keyCode === 13 && event.altKey
  }
}

const handleKey = (event) => {
  if (wantToSend(event)) {
    if (!isEditing.value) {
      _submitText(event)
    } else {
      _editText(event)
    }
    _editFinish()
    event.preventDefault()
  } else if (event.keyCode === 27) {
    _editFinish()
    event.preventDefault()
  }

  emit('onType')
}

const focusUserInput = () => {
  nextTick(() => {
    if (userInput.value) {
      userInput.value.focus()
    }
  })
}

const _submitSuggestion = (suggestion) => {
  props.onSubmit({author: 'me', type: 'text', data: {text: suggestion, sent: false}})
}

const _checkSubmitSuccess = (success) => {
  if (Promise !== undefined) {
    Promise.resolve(success).then(
      function (wasSuccessful) {
        if (wasSuccessful === undefined || wasSuccessful) {
          file.value = null
          userInput.value.innerHTML = ''
        }
      }.bind({file, userInput})
    )
  } else {
    file.value = null
    userInput.value.innerHTML = ''
  }
}

const _submitText = (event) => {
  const text = userInput.value.textContent
  var fileArr = []
  if (file.value) {
    fileArr.push(file.value)
  }
  fileArr.push(...userInput.value.getElementsByTagName('img'))

  if (fileArr.length > 0) {
    _submitTextWhenFile(event, text, fileArr)
  } else {
    if (text && text.trim().length > 0) {
      _checkSubmitSuccess(
        props.onSubmit({
          author: 'me',
          type: 'text',
          data: {text, sent: false}
        })
      )
    }
  }
}

const _submitTextWhenFile = (event, text, fileArr) => {
  if (text && text.length > 0) {
    _checkSubmitSuccess(
      props.onSubmit({
        author: 'me',
        type: 'file',
        data: {text, file: fileArr, sent: false}
      })
    )
  } else {
    _checkSubmitSuccess(
      props.onSubmit({
        author: 'me',
        type: 'file',
        data: {file: fileArr, sent: false}
      })
    )
  }
}

const _editText = (event) => {
  const text = userInput.value.textContent
  if (text && text.length) {
    emit('edit', {
      author: 'me',
      type: 'text',
      id: store.editMessage.id,
      data: {text}
    })
    _editFinish()
  }
}

const _handleEmojiPicked = (emoji) => {
  _checkSubmitSuccess(
    props.onSubmit({
      author: 'me',
      type: 'emoji',
      data: {emoji, sent: false}
    })
  )
}

const _handleFileSubmit = (fileData) => {
  file.value = fileData
}

const _editFinish = () => {
  store.setState('editMessage', null)
}

let _focusUserInputHandler

onMounted(() => {
  _focusUserInputHandler = () => {
    if (userInput.value) {
      focusUserInput()
    }
  }
  window.addEventListener('chat-focusUserInput', _focusUserInputHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('chat-focusUserInput', _focusUserInputHandler)
})
</script>

<style scoped>
.sc-user-input {
  min-height: 55px;
  margin: 0px;
  position: relative;
  bottom: 0;
  display: flex;
  background-color: #f4f7f9;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.sc-user-input--text {
  flex-grow: 1;
  outline: none;
  border-bottom-left-radius: 10px;
  box-sizing: border-box;
  padding: 18px;
  font-size: 15px;
  line-height: 1.33;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #565867;
  -webkit-font-smoothing: antialiased;
  max-height: 200px;
  overflow-x: hidden;
  overflow-y: auto;
}

.sc-user-input--text:empty:before {
  content: attr(placeholder);
  display: block; /* For Firefox */
  filter: contrast(15%);
  outline: none;
  cursor: text;
}

.sc-user-input--buttons {
  display: flex;
  align-items: center;
  padding: 0 4px;
}

.sc-user-input--button {
  margin: 0 4px;
}

.sc-user-input.active {
  box-shadow: none;
  background-color: white;
  box-shadow: 0px -5px 20px 0px rgba(150, 165, 190, 0.2);
}

.file-container {
  background-color: #f4f7f9;
  border-top-left-radius: 10px;
  padding: 5px 20px;
  color: #565867;
}

.delete-file-message {
  font-style: normal;
  float: right;
  cursor: pointer;
  color: #c8cad0;
}

.delete-file-message:hover {
  color: #5d5e6d;
}

.icon-file-message {
  margin-right: 5px;
}
</style>
