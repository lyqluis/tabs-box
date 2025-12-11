<script setup lang="ts"></script>

<template>
  <div class="h-screen px-6 m-auto flex flex-col gap-1">
    <!-- title -->
    <!-- <h1 class="text-lg font-bold">Tabs-Box 文件比较工具</h1> -->
    <!-- upload -->
    <div class="flex flex-col gap-3">
      <slot name="upload-container"></slot>
    </div>
    <!-- actions -->
    <div class="flex gap-3">
      <slot name="actions"></slot>
    </div>
    <!-- content 自动占用剩余空间 -->
    <div class="flex-1 flex flex-col md:flex-row gap-5 mb-2 min-h-0">
      <slot name="content-container"></slot>
    </div>
  </div>
</template>
