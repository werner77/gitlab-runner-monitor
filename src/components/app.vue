<template>
  <div class="app" @click="autoZoom()">
    <div :style="{zoom}">
      <div class="runners">
        <runner-card v-for="runner in sortedRunners" :key="runner.id" :runner="runner" />
      </div>
    </div>
    <div v-if="initialLoading" class="loader">
      <octicon name="sync" spin scale="3" />
    </div>
  </div>
</template>

<script>
  import Octicon             from 'vue-octicon/components/Octicon';
  import {getQueryParameter} from '../util';
  import RunnerCard          from './runner-card';

  export default {
    components: {
      Octicon,
      RunnerCard
    },
    name: 'app',
    data: () => ({
      runners: [],
      zoom: 1,
      initialLoading: true
    }),
    computed: {
      sortedRunners() {
        return this.$data.runners.sort((a, b) => {
          if (a.description < b.description) return -1;
          if (a.description > b.description) return 1;
          return 0;
        })
      }
    },
    mounted() {
      this.fetchRunners();

      if (getQueryParameter('autoZoom')) {
        setInterval(() => {
          this.autoZoom();
        }, 5000);
      }

      this.refreshIntervalId = setInterval(async () => {
        if (!this.$data.loading) {
          await this.fetchRunners();
        }
      }, 10000);
    },
    beforeDestroy() {
      clearInterval(this.refreshIntervalId);
    },
    methods: {
      async fetchRunners() {
        const gitlabApiParams = {
          per_page: 100
        };

        const runners = await this.$api('/runners', gitlabApiParams, {follow_next_page_links: true});
        const regex = /ios-[0-9]+\.[0-9]/

        this.$data.runners = runners.filter((runner) => {
          return regex.test(runner.description)
        });

        if (getQueryParameter('autoZoom')) {
          this.$nextTick(() => this.autoZoom());
        }

        this.$data.initialLoading = false;
      },
      async autoZoom() {
        let step = 0.1;

        if (this.$el.clientHeight > window.innerHeight) {
          step = -0.1;
        }

        while (
          (step > 0 && this.$el.clientHeight <= window.innerHeight) ||
          (step < 0 && this.$el.clientHeight > window.innerHeight)
        ) {
          this.$data.zoom += step;
          await this.$nextTick();

          if (this.$data.zoom > 20 || this.$data.zoom < 0) {
            // The browser likely doesn't support CSS zoom
            this.$data.zoom = 0;
            return;
          }
        }

        if (step > 0) this.$data.zoom -= step;
      }
    }
  };
</script>

<style lang="scss">
  html {
    background-color: #212121;
    color: #dddddd;
    font-family: Roboto, sans-serif;
  }

  body {
    margin: 0;
    padding: 4px;
    overflow-y: hidden;
  }

  svg {
    overflow: visible;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.15s
  }

  .fade-enter, .fade-leave-to {
    opacity: 0
  }
</style>

<style lang="scss" scoped>
  .app {
    .runners {
      display: flex;
      flex-wrap: wrap;
      justify-content: left;
    }

    .loader {
      display: flex;
      justify-content: center;
      align-items: center;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: transparentize(#212121, 0.5);
    }
  }
</style>
