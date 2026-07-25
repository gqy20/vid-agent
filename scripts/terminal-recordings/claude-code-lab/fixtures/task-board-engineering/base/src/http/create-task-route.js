import {createTask} from '../tasks/create-task.js';

export const createTaskRoute = (request, store) => ({
  status: 201,
  body: createTask(request.body, store),
});
