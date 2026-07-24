import {createTask} from '../tasks/create-task.js';

export const createTaskRoute = (request, store) => {
  const task = createTask(request.body, store);
  return {status: 201, body: task};
};
