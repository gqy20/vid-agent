export const updateTaskRoute = (request, store) => {
  const task = store.rename(Number(request.params.id), request.body.title);
  return task ? {status: 200, body: task} : {status: 404, body: {error: 'not found'}};
};
