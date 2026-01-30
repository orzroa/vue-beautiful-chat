<template>
  <div :id="message.id" class="sc-message" :title="messageTitle">
    <div
      class="sc-message--content"
      :class="{
        sent: message.author === 'me',
        received: message.author !== 'me' && message.type !== 'system',
        system: message.type === 'system'
      }"
    >
      <slot name="user-avatar" :message="message" :user="user">
        <div
          v-if="message.type !== 'system' && authorName && authorName !== 'me'"
          v-tooltip="authorName"
          :title="authorName"
          class="sc-message--avatar"
          :style="{
            backgroundImage: `url(${chatImageUrl})`
          }"
        ></div>
      </slot>

      <TextMessage
        v-if="message.type === 'text'"
        :message="message"
        :message-colors="messageColors"
        :message-styling="messageStyling"
        @remove="$emit('remove')"
      >
        <template #default="scopedProps">
          <slot
            name="text-message-body"
            :message="scopedProps.message"
            :message-text="scopedProps.messageText"
            :message-colors="scopedProps.messageColors"
            :me="scopedProps.me"
          >
          </slot>
        </template>
        <template #text-message-toolbox="scopedProps">
          <slot name="text-message-toolbox" :message="scopedProps.message" :me="scopedProps.me">
          </slot>
        </template>
      </TextMessage>
      <EmojiMessage v-else-if="message.type === 'emoji'" :data="message.data" />
      <FileMessage
        v-else-if="message.type === 'file'"
        :data="message.data"
        :message-colors="messageColors"
      />
      <TypingMessage v-else-if="message.type === 'typing'" :message-colors="messageColors" />
      <SystemMessage
        v-else-if="message.type === 'system'"
        :data="message.data"
        :message-colors="messageColors"
      >
        <slot name="system-message-body" :message="message.data"> </slot>
      </SystemMessage>
    </div>
    <div v-if="showSent && message.author === 'me'" class="sc-message--toolbox">
      <IconBase
        v-if="message.data.sent"
        :color="messageColors.backgroundColor"
        width="10"
        icon-name="sent"
      >
        <IconSent />
      </IconBase>
      <button v-else @click="$emit('resend')">
        <IconBase color="red" width="24" view-box="0 0 24 24" icon-name="resend">
          <IconResend />
        </IconBase>
      </button>
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue'
import store from './store/'
import TextMessage from './messages/TextMessage.vue'
import FileMessage from './messages/FileMessage.vue'
import EmojiMessage from './messages/EmojiMessage.vue'
import TypingMessage from './messages/TypingMessage.vue'
import SystemMessage from './messages/SystemMessage.vue'
import chatIcon from './assets/chat-icon.svg'
import IconBase from './components/IconBase.vue'
import IconSent from './components/icons/IconSent.vue'
import IconResend from './components/icons/IconResend.vue'

defineOptions({
  name: 'ChatMessage'
})

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  colors: {
    type: Object,
    required: true
  },
  messageStyling: {
    type: Boolean,
    required: true
  },
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['remove', 'resend'])

const authorName = computed(() => {
  return props.user && props.user.name
})

const chatImageUrl = computed(() => {
  return (props.user && props.user.imageUrl) || chatIcon
})

const messageColors = computed(() => {
  return props.message.author === 'me' ? sentColorsStyle.value : receivedColorsStyle.value
})

const receivedColorsStyle = computed(() => {
  return {
    color: props.colors.receivedMessage.text,
    backgroundColor: props.colors.receivedMessage.bg
  }
})

const sentColorsStyle = computed(() => {
  return {
    color: props.colors.sentMessage.text,
    backgroundColor: props.colors.sentMessage.bg
  }
})

const messageTitle = computed(() => {
  if (props.message.timeStamp) {
    return new Date(props.message.timeStamp)
  } else {
    return ''
  }
})

const showSent = computed(() => store.showSent)
</script>

<style lang="scss">
/* TODO: re-org and scope this style block */

.sc-message {
  margin-bottom: 10px;
  display: flex;
  .sc-message--edited {
    opacity: 0.7;
    word-wrap: normal;
    font-size: xx-small;
    text-align: center;
  }
  .sc-message--toolbox {
    transition: left 0.2s ease-out 0s;
    white-space: normal;
    opacity: 1;
    position: flex;
    left: 0px;
    width: 25px;
    top: 0;
    button {
      background: none;
      border: none;
      padding: 0px;
      margin: 0px;
      outline: none;
      width: 100%;
      text-align: center;
      cursor: pointer;
      &:focus {
        outline: none;
      }
    }
    & :deep(svg) {
      margin-left: 5px;
    }
  }
}

.sc-message--content {
  width: 100%;
  display: flex;
}

.sc-message--content.sent {
  justify-content: flex-end;
}

.sc-message--content.system {
  justify-content: center;
}

.sc-message--content.sent .sc-message--avatar {
  display: none;
}

.sc-message--avatar {
  background-repeat: no-repeat;
  background-size: 100%;
  background-position: center;
  min-width: 30px;
  min-height: 30px;
  border-radius: 50%;
  align-self: center;
  margin-right: 15px;
}

.sc-message--meta {
  font-size: xx-small;
  margin-bottom: 0px;
  color: white;
  text-align: center;
}

.tooltip {
  display: block !important;
  z-index: 10000;
  .tooltip-inner {
    background: black;
    color: white;
    border-radius: 16px;
    padding: 5px 10px 4px;
  }
  .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: black;
    z-index: 1;
  }
  &[x-placement^='top'] {
    margin-bottom: 5px;
    .tooltip-arrow {
      border-width: 5px 5px 0 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      bottom: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }
  &[x-placement^='bottom'] {
    margin-top: 5px;
    .tooltip-arrow {
      border-width: 0 5px 5px 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-top-color: transparent !important;
      top: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }
  &[x-placement^='right'] {
    margin-left: 5px;
    .tooltip-arrow {
      border-width: 5px 5px 5px 0;
      border-left-color: transparent !important;
      border-top-color: transparent !important;
      border-bottom-color: transparent !important;
      left: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }
  &[x-placement^='left'] {
    margin-right: 5px;
    .tooltip-arrow {
      border-width: 5px 0 5px 5px;
      border-top-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      right: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }
  &[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition:
      opacity 0.15s,
      visibility 0.15s;
  }
  &[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity 0.15s;
  }
  &.info {
    $color: rgba(#004499, 0.9);
    .tooltip-inner {
      background: $color;
      color: white;
      padding: 24px;
      border-radius: 5px;
      box-shadow: 0 5px 30px rgba(black, 0.1);
    }
    .tooltip-arrow {
      border-color: $color;
    }
  }
  &.popover {
    $color: #f9f9f9;
    .popover-inner {
      background: $color;
      color: black;
      padding: 24px;
      border-radius: 5px;
      box-shadow: 0 5px 30px rgba(black, 0.1);
    }
    .popover-arrow {
      border-color: $color;
    }
  }
}
</style>
