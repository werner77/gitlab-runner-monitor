# GitLab Runner Monitor

![Logo](/logo.svg)

> A browser-based monitor dashboard for GitLab CI Runners based on a fork of https://github.com/timoschwarzer/gitlab-monitor

This dashboard shows the last jobs that have been running

## Use & Download

## Screenshots

![Screenshot 1](/../resources/screenshots/screenshot1.png?raw=true)
![Screenshot 2](/../resources/screenshots/screenshot2.png?raw=true)

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

`
http://gitlab-monitor.local/<params>
`

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

