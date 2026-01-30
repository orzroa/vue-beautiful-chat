<template>
  <div>
    <div
      v-if="showLauncher"
      class="sc-launcher"
      :class="{opened: isOpen}"
      :style="{backgroundColor: colors.launcher.bg}"
      @click.prevent="isOpen ? close() : openAndFocus()"
    >
      <div v-if="newMessagesCount > 0 && !isOpen" class="sc-new-messsages-count">
        {{ newMessagesCount }}
      </div>
      <img v-if="isOpen" class="sc-closed-icon" :src="icons.close.img" :alt="icons.close.name" />
      <img v-else class="sc-open-icon" :src="icons.open.img" :alt="icons.open.name" />
    </div>
    <ChatWindow
      :message-list="messageList"
      :on-user-input-submit="onMessageWasSent"
      :participants="participants"
      :title="chatWindowTitle"
      :is-open="isOpen"
      :show-emoji="showEmoji"
      :show-file="showFile"
      :show-header="showHeader"
      :placeholder="placeholder"
      :show-typing-indicator="showTypingIndicator"
      :colors="colors"
      :always-scroll-to-bottom="alwaysScrollToBottom"
      :message-styling="messageStyling"
      @close="close"
      @scroll-to-top="$emit('scrollToTop')"
      @on-type="$emit('onType')"
      @edit="$emit('edit', $event)"
      @remove="$emit('remove', $event)"
      @resend="$emit('resend', $event)"
    >
      <template #header>
        <slot name="header"> </slot>
      </template>
      <template #user-avatar="scopedProps">
        <slot name="user-avatar" :user="scopedProps.user" :message="scopedProps.message"> </slot>
      </template>
      <template #text-message-body="scopedProps">
        <slot
          name="text-message-body"
          :message="scopedProps.message"
          :message-text="scopedProps.messageText"
          :message-colors="scopedProps.messageColors"
          :me="scopedProps.me"
        >
        </slot>
      </template>
      <template #system-message-body="scopedProps">
        <slot name="system-message-body" :message="scopedProps.message"> </slot>
      </template>
      <template #text-message-toolbox="scopedProps">
        <slot name="text-message-toolbox" :message="scopedProps.message" :me="scopedProps.me">
        </slot>
      </template>
    </ChatWindow>
  </div>
</template>

<script setup>
import {computed, watch} from 'vue'
import store from './store/'
import ChatWindow from './ChatWindow.vue'
import CloseIcon from './assets/close-icon.png'
import OpenIcon from './assets/logo-no-bg.svg'

defineOptions({
  name: 'ChatLauncher'
})

const props = defineProps({
  icons: {
    type: Object,
    default: function () {
      return {
        open: {
          img: OpenIcon,
          name: 'default'
        },
        close: {
          img: CloseIcon,
          name: 'default'
        }
      }
    }
  },
  showEmoji: {
    type: Boolean,
    default: false
  },
  showEdition: {
    type: Boolean,
    default: false
  },
  showDeletion: {
    type: Boolean,
    default: false
  },
  showCopy: {
    type: Boolean,
    default: false
  },
  showSent: {
    type: Boolean,
    default: false
  },
  isOpen: {
    type: Boolean,
    required: true
  },
  open: {
    type: Function,
    required: true
  },
  close: {
    type: Function,
    required: true
  },
  showFile: {
    type: Boolean,
    default: false
  },
  showLauncher: {
    type: Boolean,
    default: true
  },
  showCloseButton: {
    type: Boolean,
    default: true
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  participants: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: () => ''
  },
  titleImageUrl: {
    type: String,
    default: () => ''
  },
  onMessageWasSent: {
    type: Function,
    required: true
  },
  messageList: {
    type: Array,
    default: () => []
  },
  newMessagesCount: {
    type: Number,
    default: () => 0
  },
  placeholder: {
    type: String,
    default: 'Write a message...'
  },
  showTypingIndicator: {
    type: String,
    default: () => ''
  },
  colors: {
    type: Object,
    validator: (c) =>
      'header' in c &&
      'bg' in c.header &&
      'text' in c.header &&
      'launcher' in c &&
      'bg' in c.launcher &&
      'messageList' in c &&
      'bg' in c.messageList &&
      'sentMessage' in c &&
      'bg' in c.sentMessage &&
      'text' in c.sentMessage &&
      'receivedMessage' in c &&
      'bg' in c.receivedMessage &&
      'text' in c.receivedMessage &&
      'userInput' in c &&
      'bg' in c.userInput &&
      'text' in c.userInput,
    default: function () {
      return {
        header: {
          bg: '#4e8cff',
          text: '#ffffff'
        },
        launcher: {
          bg: '#4e8cff'
        },
        messageList: {
          bg: '#ffffff'
        },
        sentMessage: {
          bg: '#4e8cff',
          text: '#ffffff'
        },
        receivedMessage: {
          bg: '#f4f7f9',
          text: '#ffffff'
        },
        userInput: {
          bg: '#f4f7f9',
          text: '#565867'
        }
      }
    }
  },
  alwaysScrollToBottom: {
    type: Boolean,
    default: () => false
  },
  messageStyling: {
    type: Boolean,
    default: () => false
  },
  disableUserListToggle: {
    type: Boolean,
    default: false
  },
  enterToSend: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['scrollToTop', 'onType', 'edit', 'remove', 'resend'])

const chatWindowTitle = computed(() => {
  if (props.title !== '') return props.title

  if (props.participants.length === 0) return 'You'
  if (props.participants.length > 1) return 'You, ' + props.participants[0].name + ' & others'

  return 'You & ' + props.participants[0].name
})

watch(
  () => props,
  (newProps) => {
    for (const prop in newProps) {
      store.setState(prop, newProps[prop])
    }
  },
  {deep: true, immediate: true}
)

const openAndFocus = () => {
  props.open()
  window.dispatchEvent(new CustomEvent('chat-focusUserInput'))
}
</script>

<style scoped>
.sc-launcher {
  width: 60px;
  height: 60px;
  background-position: center;
  background-repeat: no-repeat;
  position: fixed;
  right: 25px;
  bottom: 25px;
  border-radius: 50%;
  box-shadow: none;
  transition: box-shadow 0.2s ease-in-out;
  cursor: pointer;
}

.sc-launcher:before {
  content: '';
  position: relative;
  display: block;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  transition: box-shadow 0.2s ease-in-out;
}

.sc-launcher .sc-open-icon,
.sc-launcher .sc-closed-icon {
  width: 60px;
  height: 60px;
  position: fixed;
  right: 25px;
  bottom: 25px;
  transition:
    opacity 100ms ease-in-out,
    transform 100ms ease-in-out;
}

.sc-launcher .sc-closed-icon {
  transition:
    opacity 100ms ease-in-out,
    transform 100ms ease-in-out;
  width: 60px;
  height: 60px;
}

.sc-launcher .sc-open-icon {
  padding: 20px;
  box-sizing: border-box;
  opacity: 1;
}

.sc-launcher.opened .sc-open-icon {
  transform: rotate(-90deg);
  opacity: 1;
}

.sc-launcher.opened .sc-closed-icon {
  transform: rotate(-90deg);
  opacity: 1;
}

.sc-launcher.opened:before {
  box-shadow: 0px 0px 400px 250px rgba(148, 149, 150, 0.2);
}

.sc-launcher:hover {
  box-shadow: 0 0px 27px 1.5px rgba(0, 0, 0, 0.2);
}

.sc-new-messsages-count {
  position: absolute;
  top: -3px;
  left: 41px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  background: #ff4646;
  color: white;
  text-align: center;
  margin: auto;
  font-size: 12px;
  font-weight: 500;
}
</style>
