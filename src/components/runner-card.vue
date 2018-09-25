<template>
  <div :class="['runner-card', runner.status]">
    <div class="content">
      <div class="title">{{ runner.description }} ({{ runner.id }})</div>
      <div class="jobs-container">
        <em v-if="jobs !== null && jobs.length === 0" class="no-jobs">
          No active jobs
        </em>
        <div v-else-if="jobs !== null && jobs.length > 0">
          <div v-for="job in jobs">
            <runner-job-view :job="job" :runner="runner" />
          </div>
        </div>
        <octicon v-else name="sync" scale="1.4" spin />
      </div>
    </div>
    <div class="spacer"></div>
    <div class="info">
      <div v-for="job in lastJobs">
        <a target="_blank" rel="noopener noreferrer" :href="baseUrl + '/' + job.project.path_with_namespace + '/-/jobs/' + job.id">
          <span :class="['dot', job.status]"></span>
        </a>
      </div>
      <div class="spacer"></div>
      <gitlab-icon class="calendar-icon" name="calendar" size="12" />
      <timeago v-if="lastUpdated !== null" :since="lastUpdated" :auto-update="1"></timeago>
      <time v-else>...</time>
    </div>
  </div>
</template>

<script>
  import format              from 'date-fns/format'
  import Octicon             from 'vue-octicon/components/Octicon';
  import {getQueryParameter} from '../util';
  import GitlabIcon          from './gitlab-icon';
  import RunnerJobView       from './runner-job-view';
  import 'vue-octicon/icons/git-branch';
  import 'vue-octicon/icons/clock';
  import 'vue-octicon/icons/sync';

  export default {
    components: {
      RunnerJobView,
      GitlabIcon,
      Octicon
    },
    name: 'runner-card',
    props: ['runner'],
    data: () => ({
      runnerId: null,
      lastJobs: null,
      jobs: null,
      loading: false,
      lastUpdated: null
    }),
    computed: {
      baseUrl() {
        const job = this.$props.job;
        const apiUrl = getQueryParameter('gitlabApi');
        const index = apiUrl.indexOf('/api/');
        return apiUrl.substring(0, index);
      }
    },
    mounted() {
      this.fetchRunnerJobs();
    },
    beforeDestroy() {
      if (this.refreshTimerId) {
        clearTimeout(this.refreshTimerId);
      }
    },
    watch: {
      runner() {
        if (this.$data.runnerId !== this.$props.runner.id) {
          this.$data.runnerId = this.$props.runner.id;
          this.fetchRunnerJobs();
        }
      }
    },
    methods: {
      async fetchRunnerJobs() {

        if (this.refreshTimerId) {
          clearTimeout(this.refreshTimerId);
        }

        const runnerId = this.$props.runner.id
        this.$data.loading = true;

        try {
          const allJobs = await this.$api(`/runners/${runnerId}/jobs`, {per_page: 20}, {get_last_page: true});

          if (runnerId === this.$props.runner.id) {
            const sortedJobs = allJobs.sort(function(a,b) {
              const d1 = new Date(a.started_at);
              const d2 = new Date(b.started_at);
              return d2.getTime() - d1.getTime();
            });

            this.$data.lastJobs = sortedJobs.slice(1, Math.min(10, sortedJobs.length));
            this.$data.jobs = sortedJobs.slice(0, 1);
            this.$data.lastUpdated = format(new Date());
          }
        } catch (err) {
          console.log("Could not retrieve runner jobs: ", err);
        }

        this.$data.loading = false;

        this.refreshTimerId = setTimeout(async () => {
          await this.fetchRunnerJobs();
        }, 10000);
      }
    }
  };
</script>

<style lang="scss" scoped>
  .runner-card {
    margin: 4px;
    border-radius: 3px;
    background-color: #424242;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    transition: background-color 200ms;

    &.active {
      background-color: #2E7D32;
    }

    &.online {
      background-color: #2E7D32;
    }

    &.paused {
      background-color: #FC9401;
    }

    &.offline {
      background-color: #C62828;
    }

    .content {
      padding: 12px;

      .title {
        white-space: nowrap;
        font-size: 16px;
        font-weight: bold;
        text-shadow: 1.5px 1.5px rgba(0, 0, 0, 0.4);
        text-decoration: none;
        color: inherit;

        &.small {
          font-size: 12px;
          line-height: 0.6;
        }
      }

      .jobs-container {
        padding: 8px 0 0 0;
      }

      .no-pipelines {
        color: rgba(255, 255, 255, 0.5);
        font-size: 10px;
      }
    }

    .spacer {
      flex-grow: 1;
    }

    .info {
      padding: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.3);

      time {
        line-height: 1;
      }

      .calendar-icon {
        margin-right: 4px;
      }

      .dot {
        height: 10px;
        width: 10px;
        border-radius: 50%;
        border-color: white;
        border-width: 2px;
        display: inline-block;
        margin-right: 5px;
        border-style: solid;

        &.success {
          background-color: #2E7D32;
        }

        &.running {
          background-color: #1565C0;
        }

        &.pending, &.warning {
          background-color: #EF6C00;
        }

        &.failed {
          background-color: #C62828;
        }

        &.canceled {
          background-color: #010101;
        }

        &.skipped, &.manual {
          background-color: #4b4b4b;
        }
      }
    }
  }
</style>
