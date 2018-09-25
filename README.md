# GitLab Runner Monitor

![Logo](/logo.svg)

> A browser-based monitor dashboard for GitLab CI Runners based on a fork of https://github.com/timoschwarzer/gitlab-monitor

This dashboard shows the latest jobs that have been running for an optionally filtered list of Gitlab runners.

The dashboard will show a card denoting the status of the runner itself were the background color indicates the status:

- green=online
- red=offline
- orange=paused

Inside the card the last job this runner ran is shown with a color coded status:

- green=succesful
- red=failure
- black=cancelled
- blue=running

The job view will show the name of the project, the branch for which it was built,
info from the commit that triggered the job (shortened commit hash, commit title and user that made the change), 
the pipeline id, the name of the job, the start date and the duration of the job.

Colored dots at the bottom will show the status of previous jobs that have run on that runner were subsequent 
failures might indicate an unhealthy runner.

Every item is hyperlinked to the appropriate view in Gitlab. Clicking on the user name will initiate an email action.

## Download

Just clone the repository or download the zip.

## Build Setup

``` bash
# install dependencies
yarn install

# serve with hot reload at localhost:8080
yarn run dev

# build for production with minification
yarn run build
```

## Usage

- Build with: 

`
yarn run build
`

- Copy the dist folder to a HTTP server of your choice with some defined hostname
- Navigate with browser to http://hostname/?gitlabApi=GITLAB_URL&privateToken=GITLAB_TOKEN&additionalParams...

See parameters below for details.


## Available params

Name                            | Description
--------------------------------|--------------------------------------------
`gitlabApi` (required)          | URL to your GitLab API. (e.g. `https://gitlab.example.com/api/v4`)
`privateToken` (required)       | Private token to access the GitLab API
`autoZoom`                      | Zooms the dashboard to fill the screen with all displayed projects. [Not compatible](https://caniuse.com/#feat=css-zoom) with all browsers! Default: `false`
`descriptionRegex`              | Regular expression for the description of the GitLab runners to show. If not specified all GitLab runners will be shown. If descriptionList is also supplied, any match of the two will be shown.
`descriptionList`               | Comma separated string of descriptions of the GitLab runners to show.

## Used libraries

- [Vue](https://vuejs.org)
- [vue-timeago](https://github.com/egoist/vue-timeago)
- [vue-octicon](https://github.com/Justineo/vue-octicon)
- [GitLab SVG icons](https://gitlab.com/gitlab-org/gitlab-svgs)

