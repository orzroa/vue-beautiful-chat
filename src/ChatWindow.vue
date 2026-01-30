<template>
  <div class="sc-chat-window" :class="{opened: isOpen, closed: !isOpen}">
    <ChatHeader
      v-if="showHeader"
      :title="title"
      :colors="colors"
      @close="$emit('close')"
      @user-list="handleUserListToggle"
    >
      <slot name="header"> </slot>
    </ChatHeader>
    <UserList v-if="showUserList" :colors="colors" :participants="participants" />
    <MessageList
      v-if="!showUserList"
      :messages="messages"
      :participants="participants"
      :show-typing-indicator="showTypingIndicator"
      :colors="colors"
      :always-scroll-to-bottom="alwaysScrollToBottom"
      :message-styling="messageStyling"
      @scroll-to-top="$emit('scrollToTop')"
      @remove="$emit('remove', $event)"
      @resend="$emit('resend', $event)"
    >
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
    </MessageList>
    <UserInput
      v-if="!showUserList"
      :show-emoji="showEmoji"
      :on-submit="onUserInputSubmit"
      :suggestions="getSuggestions()"
      :show-file="showFile"
      :placeholder="placeholder"
      :colors="colors"
      @on-type="$emit('onType')"
      @edit="$emit('edit', $event)"
    />
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'
import ChatHeader from './Header.vue'
import MessageList from './MessageList.vue'
import UserInput from './UserInput.vue'
import UserList from './UserList.vue'

const props = defineProps({
  showEmoji: {
    type: Boolean,
    default: false
  },
  showFile: {
    type: Boolean,
    default: false
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
    required: true
  },
  onUserInputSubmit: {
    type: Function,
    required: true
  },
  messageList: {
    type: Array,
    default: () => []
  },
  isOpen: {
    type: Boolean,
    default: () => false
  },
  placeholder: {
    type: String,
    required: true
  },
  showTypingIndicator: {
    type: String,
    required: true
  },
  colors: {
    type: Object,
    required: true
  },
  alwaysScrollToBottom: {
    type: Boolean,
    required: true
  },
  messageStyling: {
    type: Boolean,
    required: true
  }
})

defineEmits(['close', 'scrollToTop', 'remove', 'resend', 'onType', 'edit'])

const showUserList = ref(false)

const messages = computed(() => {
  return props.messageList
})

const handleUserListToggle = (show) => {
  showUserList.value = show
}

const getSuggestions = () => {
  return messages.value.length > 0 ? messages.value[messages.value.length - 1].suggestions : []
}
</script>

<style scoped>
.sc-chat-window.full {
  width: 100%;
  height: 100%;
  max-height: 100%;
  position: fixed;
  left: 0px;
  top: 0px;
  box-sizing: border-box;
  box-shadow: 0px 7px 40px 2px rgba(148, 149, 150, 0.1);
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 10px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  animation: fadeIn;
  animation-duration: 0.3s;
  animation-timing-function: ease-in-out;
}

.sc-chat-window {
  width: 370px;
  height: calc(100% - 120px);
  max-height: 590px;
  position: fixed;
  right: 25px;
  bottom: 100px;
  box-sizing: border-box;
  box-shadow: 0px 7px 40px 2px rgba(148, 149, 150, 0.1);
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 10px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  animation: fadeIn;
  animation-duration: 0.3s;
  animation-timing-function: ease-in-out;
}

.sc-chat-window.closed {
  opacity: 0;
  display: none;
  bottom: 90px;
}

@keyframes fadeIn {
  0% {
    display: none;
    opacity: 0;
  }

  100% {
    display: flex;
    opacity: 1;
  }
}

.sc-message--me {
  text-align: right;
}
.sc-message--them {
  text-align: left;
}

@media (max-width: 450px) {
  .sc-chat-window {
    width: 100%;
    height: 100%;
    max-height: 100%;
    right: 0px;
    bottom: 0px;
    border-radius: 0px;
  }
  .sc-chat-window {
    transition: 0.1s ease-in-out;
  }
  .sc-chat-window.closed {
    bottom: 0px;
  }
}
</style>
