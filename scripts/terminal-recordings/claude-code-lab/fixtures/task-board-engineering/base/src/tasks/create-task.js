export const createTask = ({title}, store) => {
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('title is required');
  }

  return store.save({title: title.trim(), completed: false});
};
