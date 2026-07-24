export const createTaskStore = () => {
  const tasks = [];

  return {
    save(input) {
      const task = {id: tasks.length + 1, ...input};
      tasks.push(task);
      return task;
    },
    all() {
      return [...tasks];
    },
  };
};
