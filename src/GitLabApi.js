import axios from 'axios';
import parse from 'parse-link-header'

const GitLabApi = {};

GitLabApi.install = (Vue, options) => {
  Vue.prototype.$api = async (path, params = {}, behaviour = {}) => {
    const apiParams = {
      baseURL: options.gitlab_api_url,
      params,
      headers: {'Private-Token': options.private_token}
    }

    while (true) {
      console.log('api params: ', apiParams);
      const response = await axios.get(path, apiParams);
      const result = response.data;
      if (behaviour.get_last_page) {

        const currentPage = params['page'] || 1;
        const totalPages = response.headers['x-total-pages'] || 1;

        if (totalPages > currentPage) {
          params['page'] = totalPages;
          continue;
        }

      } else if (behaviour.follow_next_page_links) {
        // Find the "next" link header and follow it, until we get a result that has no next link
        let parsedLinks = parse(response.headers.link);
        while (parsedLinks && parsedLinks.next) {
          const nextResponse = await axios.get(parsedLinks.next.url, {
            headers: {'Private-Token': options.private_token}
          });
          result.push(...nextResponse.data);
          parsedLinks = parse(nextResponse.headers.link);
        }
      }
      return result;
    }
  };
};

export default GitLabApi;
