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
      initialLoading: true,
      loading: false
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
    },
    beforeDestroy() {
      if (this.refreshTimerId) {
        clearTimeout(this.refreshTimerId);
      }
    },
    methods: {
      async fetchRunners() {

        if (this.refreshTimerId) {
          clearTimeout(this.refreshTimerId);
        }

        this.$data.loading = true

        try {

          const gitlabApiParams = {
            per_page: 100
          };

          const runners = await this.$api('/runners', gitlabApiParams, {follow_next_page_links: true});

          const descriptionRegex = getQueryParameter('descriptionRegex');
          const descriptionsString = getQueryParameter('descriptionList');
          var regex = null;
          var descriptions = null;

          if (descriptionRegex) {
            regex = new RegExp(descriptionRegex);
          }
          if (descriptionsString) {
            descriptions = descriptionsString.split(',');
          }

          this.$data.runners = runners.filter((runner) => {
            var matches = regex === null && descriptions === null;
            if (regex) {
              matches = matches || regex.test(runner.description);
            }
            if (descriptions) {
              matches = matches || descriptions.includes(runner.description);
            }
            return matches;
          });

          if (getQueryParameter('autoZoom')) {
            this.$nextTick(() => this.autoZoom());
          }

        } catch(err) {
          console.log("Could not get runners: ", err);
        }

        this.$data.initialLoading = false;
        this.$data.loading = false;

        this.refreshTimerId = setTimeout(async () => {
          await this.fetchRunners();
        }, 120000);

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
