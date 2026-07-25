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
    rename(id, title) {
      const index = tasks.findIndex((task) => task.id === id);
      if (index === -1) return null;
      tasks[index] = {id, title, completed: tasks[index].completed, dueDate: null};
      return {...tasks[index]};
    },
    all() {
      return tasks.map((task) => ({...task}));
    },
  };
};
