<template>
  <div
    ref="scrollList"
    class="sc-message-list"
    :style="{backgroundColor: colors.messageList.bg}"
    @scroll="handleScroll"
  >
    <Message
      v-for="(message, idx) in messages"
      :key="idx"
      :message="message"
      :user="profile(message.author)"
      :colors="colors"
      :message-styling="messageStyling"
      @remove="$emit('remove', message)"
      @resend="$emit('resend', message)"
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
    </Message>
    <Message
      v-show="showTypingIndicator !== ''"
      :message="{author: showTypingIndicator, type: 'typing'}"
      :user="profile(showTypingIndicator)"
      :colors="colors"
      :message-styling="messageStyling"
    />
  </div>
</template>

<script setup>
import {ref, onMounted, onUpdated, nextTick, computed} from 'vue'
import Message from './Message.vue'
import chatIcon from './assets/chat-icon.svg'

defineOptions({
  name: 'ChatMessageList'
})

const props = defineProps({
  participants: {
    type: Array,
    required: true
  },
  messages: {
    type: Array,
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

const emit = defineEmits(['remove', 'resend', 'scrollToTop'])

const scrollList = ref(null)

const defaultChatIcon = computed(() => {
  return chatIcon
})

const _scrollDown = () => {
  if (scrollList.value) {
    scrollList.value.scrollTop = scrollList.value.scrollHeight
  }
}

const handleScroll = (e) => {
  if (e.target.scrollTop === 0) {
    emit('scrollToTop')
  }
}

const shouldScrollToBottom = () => {
  if (!scrollList.value) return false
  const scrollTop = scrollList.value.scrollTop
  const scrollable = scrollTop > scrollList.value.scrollHeight - 600
  return props.alwaysScrollToBottom || scrollable
}

const profile = (author) => {
  const profileData = props.participants.find((profile) => profile.id === author)

  // A profile may not be found for system messages or messages by 'me'
  return profileData || {imageUrl: '', name: ''}
}

onMounted(() => {
  nextTick(_scrollDown())
})

onUpdated(() => {
  if (shouldScrollToBottom()) nextTick(_scrollDown())
})
</script>

<style scoped>
.sc-message-list {
  height: 80%;
  overflow-y: auto;
  background-size: 100%;
  padding: 40px 20px;
}
</style>
