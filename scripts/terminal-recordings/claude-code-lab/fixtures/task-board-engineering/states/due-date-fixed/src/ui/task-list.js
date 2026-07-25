export const formatDueDate = (dueDate) => dueDate ?? '';

export const renderTaskList = (tasks) => tasks
  .map((task) => {
    const due = formatDueDate(task.dueDate);
    return `${task.completed ? '[x]' : '[ ]'} ${task.title}${due ? ` · ${due}` : ''}`;
  })
  .join('\n');
