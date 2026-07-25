const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const createTask = ({title, dueDate}, store) => {
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('title is required');
  }
  if (dueDate !== undefined && !ISO_DATE.test(dueDate)) {
    throw new Error('dueDate must use YYYY-MM-DD');
  }

  return store.save({title: title.trim(), completed: false, dueDate: dueDate ?? null});
};
