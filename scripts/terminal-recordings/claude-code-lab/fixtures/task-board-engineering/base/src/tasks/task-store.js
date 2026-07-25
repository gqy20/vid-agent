export const createTaskStore = () => {
  const tasks = [];

  return {
    save(input) {
      const task = {id: tasks.length + 1, ...input};
      tasks.push(task);
      return task;
    },
    find(id) {
      return tasks.find((task) => task.id === id) ?? null;
    },
    all() {
      return tasks.map((task) => ({...task}));
    },
  };
};
