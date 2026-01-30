<template>
  <div class="user-list" :style="{background: userListColor.userList.bg}">
    <table style="padding-top: 5px">
      <tbody>
        <tr v-for="user in participants" :key="user.id">
          <td style="text-align: center">
            <img :src="user.imageUrl" class="img-msg" />
          </td>
          <td class="user-element" :style="{color: userListColor.userList.text}">
            {{ user.name }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import {computed} from 'vue'

defineOptions({
  name: 'ChatUserList'
})

const props = defineProps({
  participants: {
    type: Array,
    required: true
  },
  colors: {
    type: Object,
    default: () => ({})
  }
})

const userListColor = computed(() => {
  const defaultColors = {
    userList: {
      bg: '#FFFFFF',
      text: '#000000'
    }
  }
  return Object.assign(defaultColors, props.colors)
})
</script>

<style scoped>
.user-list {
  height: 100%;
  overflow: auto;
  padding-left: 5px;
  padding-top: 8px;
}
.img-msg {
  border-radius: 50%;
  width: 50px;
  margin-right: 5px;
}
.user-element {
  font-size: 20px;
  vertical-align: middle;
}
</style>
