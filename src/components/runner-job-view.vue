<template>
  <div :class="['runner-job-view', job.status]">

    <a class="project" target="_blank" rel="noopener noreferrer" :href="projectWebUrl">
      {{ job.project.name_with_namespace }}
    </a>
    <a class="branch" target="_blank" rel="noopener noreferrer" :href="projectWebUrl + '/tree/' + job.ref">
      <octicon name="git-branch" scale="0.9" />
      {{ job.ref }}
    </a>
    <div class="commit">
      <a class="hash" target="_blank" rel="noopener noreferrer" :href="projectWebUrl + '/commit/' + job.commit.id">
        {{ job.commit.short_id }}
      </a>
      <div class="title">
        {{ job.commit.title }}
      </div>
      <gitlab-icon class="user-icon" name="user" size="10" />
      <a class="user-name" :href="'mailto:' + job.commit.author_email">{{ job.commit.author_name }}</a>
    </div>
    <div class="job">
      <a class="pipeline-id-link" target="_blank" rel="noopener noreferrer" :href="projectWebUrl + '/pipelines/' + job.pipeline.id">
        <gitlab-icon class="pipeline-icon" name="hashtag" size="12" />
        <div class="pipeline-id">{{ job.pipeline.id }}</div>
      </a>
      <a class="job-view" target="_blank" rel="noopener noreferrer" :href="projectWebUrl + '/-/jobs/' + job.id">
        <div class="job-circle">
          <transition name="fade" mode="out-in">
            <div :key="job.status">
              {{ job.name }}
            </div>
          </transition>
        </div>
        <div class="pipe"></div>
      </a>

      <gitlab-icon class="clock-icon" name="clock" size="10" />
      <span class="start-date">{{ startDateString }}</span>
      <gitlab-icon class="clock-icon" name="clock" size="10" />
      <span class="duration">{{ durationString }}</span>
    </div>

  </div>
</template>

<script>
  import Octicon             from 'vue-octicon/components/Octicon';
  import {getQueryParameter} from '../util';
  import GitlabIcon          from './gitlab-icon';
  import JobView             from './job-view';
  import 'vue-octicon/icons/sync';

  export default {
    components: {
      GitlabIcon,
      Octicon,
      JobView
    },
    name: 'runner-job-view',
    props: ['runner', 'job'],
    data: () => ({
      loading: false,
      duration: null,
      updatedAt: null
    }),
    computed: {
      durationString() {
        const duration = this.$data.duration;
        const hrs = ~~(duration / 3600);
        const mins = ~~((duration % 3600) / 60);
        const secs = Math.trunc(duration % 60);

        // Output like "1:01" or "4:03:59" or "123:03:59"
        let timeString = "";

        if (hrs > 0) {
          timeString += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }

        timeString += mins + ":" + (secs < 10 ? "0" : "");
        timeString += secs;

        return timeString;
      },
      startDateString() {
        const job = this.$props.job;
        const date = new Date(job.started_at)
        return date.toLocaleString()
      },
      projectWebUrl() {
        const job = this.$props.job;
        const apiUrl = getQueryParameter('gitlabApi');
        const index = apiUrl.indexOf('/api/');
        return apiUrl.substring(0, index) + '/' + job.project.path_with_namespace;
      }
    },
    mounted() {
      this.setupDurationCounter();
    },
    watch: {
    },
    methods: {
      setupDurationCounter() {
        const job = this.$props.job;

        const startedAtDiffSeconds = ((job.finished_at !== null ? new Date(job.finished_at) : new Date()) - new Date(job.started_at !== null ? job.started_at : job.created_at)) / 1000;

        if (job.status !== 'running' && job.duration !== null && (this.$data.duration === null || Math.abs(job.duration - this.$data.duration) > 5)) {
          this.$data.duration = job.duration;
        } else if (this.$data.duration === null || Math.abs(startedAtDiffSeconds - this.$data.updatedAt) > 5) {
          // Update the duration if the started_at property changed or the timer is >5 seconds off
          this.$data.duration = startedAtDiffSeconds;
          this.$data.updatedAt = new Date();
        }

        if (this.$props.job && this.$props.job.status === 'running') {
          if (!this.durationCounterIntervalId) {
            this.durationCounterIntervalId = setInterval(() => {
              this.$data.duration++;
            }, 1000);
          }
        } else {
          if (this.durationCounterIntervalId) {
            clearInterval(this.durationCounterIntervalId);
            this.durationCounterIntervalId = null;
          }
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  .runner-job-view {

    border: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 24px;
    padding-top: 12px;
    padding-right: 15px;
    padding-left: 15px;
    padding-bottom: 12px;

    &:not(:last-child) {
      margin-bottom: 4px;
    }

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

    .project {
      text-decoration: none;
      color: white;
    }

    .branch {
      color: rgba(255, 255, 255, 0.5);
      display: flex;
      align-items: center;
      font-size: 14px;
      padding: 0 0 2px 0;
      text-decoration: none;

      .octicon {
        margin-right: 4px;
      }
    }

    .commit {
      font-size: 12px;
      display: flex;
      align-items: center;
      padding-top: 2px;
      padding-right: 0;
      padding-left: 0;
      padding-bottom: 6px;

      .hash {
        text-decoration: none;
        color: white;
      }

      .title {
        margin-right: 5px;
        margin-left: 5px;
      }

      .user-icon {
        margin-right: 3px;
        color: rgba(255, 255, 255, 0.5);
      }

      .user-name {
        color: white;
        line-height: 1;
        text-decoration: none;
      }
    }

    .job {
      font-size: 14px;
      display: flex;
      align-items: center;
      color: white;

      .pipeline-id-link {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
      }

      .pipeline-icon {
        width: 16px;
        height: 16px;
        margin-right: 1px;
        color: rgba(255, 255, 255, 0.8);
      }

      .pipeline-id {
        margin-right: 8px;
        color: rgba(255, 255, 255, 0.8);
      }

      .clock-icon {
        margin-right: 3px;
        color: rgba(255, 255, 255, 0.5);
      }

      .job-view {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        font-size: 12px;
        color: white;

        &:last-child {
          .pipe {
            display: none;
          }
        }

        .job-circle {
          width: auto;
          display: inline-block;
          height: 24px;
          border: 2px solid rgba(255, 255, 255, 0.8);
          border-radius: 24px;
          line-height: 24px;
          padding: 0 6px;
          font-size: 12px;
          transition: background-color 200ms;
          background-color: rgba(255, 255, 255, 0.0);

          svg {
            width: 100%;
            height: 100%;
            fill: rgba(255, 255, 255, 0.8);
          }
        }

        .pipe {
          height: 2px;
          background-color: rgba(255, 255, 255, 0.8);
          width: 6px;
        }
      }

      .duration {
        color: rgba(255, 255, 255, 0.8);
        line-height: 1;
        font-size: 14px;
        margin-right: 6px;
      }

      .start-date {
        color: rgba(255, 255, 255, 0.8);
        line-height: 1;
        font-size: 14px;
        margin-right: 6px;
      }
    }
  }
</style>
