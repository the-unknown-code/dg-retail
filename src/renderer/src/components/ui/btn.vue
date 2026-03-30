<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <div class="btn">
    <span class="p">
      {{ label }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.btn {
  position: relative;
  width: 100%;
  height: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  color: white;
  text-align: center;

  //backdrop-filter: blur(2px) saturate(1.2);
  //-webkit-backdrop-filter: blur(2px) saturate(1.2);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(64, 237, 253, 0.1) 100%);

  border-radius: 30px;
  box-shadow:
    // top edge light catch
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    // bottom cyan tint
    inset 0 -1px 0 rgba(64, 237, 253, 0.2),
    // left edge
    inset 1px 0 rgba(255, 255, 255, 0.08),
    // right edge
    inset -1px 0 rgba(255, 255, 255, 0.8),
    // outer glow
    0 8px 32px rgba(15, 184, 240, 0.65),
    0 2px 8px rgba(0, 0, 0, 0.2);

  span {
    width: 100%;
    text-align: center;
    letter-spacing: 5%;
  }
}
</style>
