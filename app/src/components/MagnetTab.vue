<template>
  <div>
    <span class="text-3xl">Send a magnet</span>
    <form @submit.prevent="addTorrent">
      <div class="flex gap-2 items-center mt-3">
        <label>Input a magnet</label>
        <input
          type="text"
          v-model="magnet"
          class="border border-solid border-gray-300 rounded"
        />
      </div>
      <button
        type="submit"
        class="bg-gray-200 p-1 rounded w-20 border border-solid border-gray-300 active:bg-gray-400 mt-2 transition-all"
      >
        Add
      </button>
    </form>
  </div>
</template>
<script>
import cdk from "@/assets/cdk.json";
export default {
  data() {
    return { magnet: "" };
  },
  methods: {
    addTorrent() {
      const apiUrl = cdk?.InfraStack?.WebsocketUrl;
      if (apiUrl) {
        const socket = new WebSocket(apiUrl);
        socket.addEventListener("open", () => {
          const payload = { action: "message", msg: "Test" };
          socket.send(JSON.stringify(payload));
        });
        socket.addEventListener("message", (event) => {
          console.log(event.data);
        });
      }
    },
  },
};
</script>
