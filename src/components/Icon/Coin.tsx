import { makeIcon } from './makeIcon';

const matrix = [
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 2, 2, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0],
  [0, 0, 1, 2, 3, 3, 2, 2, 2, 1, 3, 3, 1, 1, 0, 0],
  [0, 1, 1, 2, 3, 3, 2, 3, 3, 1, 3, 3, 1, 1, 0, 0],
  [0, 1, 2, 3, 3, 3, 2, 3, 3, 1, 3, 3, 3, 1, 1, 0],
  [0, 1, 2, 3, 3, 3, 2, 3, 3, 1, 3, 3, 3, 1, 1, 0],
  [0, 1, 2, 3, 3, 3, 2, 3, 3, 1, 3, 3, 3, 1, 1, 0],
  [0, 1, 2, 3, 3, 3, 2, 3, 3, 1, 3, 3, 3, 1, 1, 0],
  [0, 1, 2, 3, 3, 3, 2, 3, 3, 1, 3, 3, 3, 1, 1, 0],
  [0, 1, 2, 3, 3, 3, 2, 3, 3, 1, 3, 3, 3, 1, 1, 0],
  [0, 1, 1, 2, 3, 3, 2, 3, 3, 1, 3, 3, 1, 1, 0, 0],
  [0, 0, 1, 2, 3, 3, 2, 1, 1, 1, 3, 3, 1, 1, 0, 0],
  [0, 0, 1, 1, 2, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0]
];
const colors = ['#060606', '#ffffff', '#ffc107'];

export default makeIcon(matrix, colors);