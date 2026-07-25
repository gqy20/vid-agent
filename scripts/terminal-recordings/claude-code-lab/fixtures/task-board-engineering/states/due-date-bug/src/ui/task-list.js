export const formatDueDate = (dueDate, timeZone = 'America/Los_Angeles') => {
  if (!dueDate) return '';
  return new Date(`${dueDate}T00:00:00Z`).toLocaleDateString('en-CA', {timeZone});
};

export const renderTaskList = (tasks, timeZone) => tasks
  .map((task) => {
    const due = formatDueDate(task.dueDate, timeZone);
    return `${task.completed ? '[x]' : '[ ]'} ${task.title}${due ? ` · ${due}` : ''}`;
  })
  .join('\n');
