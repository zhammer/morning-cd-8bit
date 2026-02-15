import qs from 'query-string';

export default function useQueryParams() {
  return qs.parse(window.location.search);
}
