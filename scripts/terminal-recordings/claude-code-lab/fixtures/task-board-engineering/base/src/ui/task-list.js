export const renderTaskList = (tasks) => tasks
  .map((task) => `${task.completed ? '[x]' : '[ ]'} ${task.title}`)
  .join('\n');
