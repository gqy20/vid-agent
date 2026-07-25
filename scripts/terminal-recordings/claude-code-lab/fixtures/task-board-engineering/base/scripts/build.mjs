import {createTaskRoute} from '../src/http/create-task-route.js';
import {createTaskStore} from '../src/tasks/task-store.js';
import {renderTaskList} from '../src/ui/task-list.js';

const store = createTaskStore();
createTaskRoute({body: {title: 'Build course'}}, store);
const output = renderTaskList(store.all());
if (!output.includes('Build course')) throw new Error('build output is incomplete');
console.log('build: ok');
