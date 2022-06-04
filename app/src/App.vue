<template>
  <div id="app">
    <div class="flex gap-5 p-4">
      <a @click="show = 'magnet'">
        <div
          :class="{
            'bg-gray-600 cursor-default hover:bg-gray-600': show === 'magnet',
          }"
          class="p-2 bg-gray-300 rounded cursor-pointer hover:bg-gray-200 active:bg-gray-600 transition-all"
        >
          Add a magnet
        </div>
      </a>
      <a @click="show = 'torrent'"
        ><div
          :class="{
            'bg-gray-600  cursor-default hover:bg-gray-600': show === 'torrent',
          }"
          class="p-2 bg-gray-300 rounded cursor-pointer hover:bg-gray-200 active:bg-gray-600 transition-all"
        >
          List of torrents
        </div></a
      >
    </div>
    <div class="p-4">
      <magnet-tab v-if="show === 'magnet'" />
      <torrent-tab v-if="show === 'torrent'" />
    </div>
  </div>
</template>

<script>
import MagnetTab from "@/components/MagnetTab.vue";
import TorrentTab from "@/components/TorrentTab.vue";
export default {
  name: "App",
  components: {
    MagnetTab,
    TorrentTab,
  },
  data() {
    return {
      show: "magnet",
    };
  },
};
</script>
