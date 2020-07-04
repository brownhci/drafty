/**
 * Work represents a callable.
 *
 * @param {TaskQueue} [queue] - The work queue its task resides in.
 * @param {Task} [task] - The task it belongs to.
 * @param {...*} [args] - Any original arguments that will be passed to this callable.
 */
type Work = (queue?: TaskQueue, task?: Task, ...args: Array<any>) => void;

/**
 * A task is an execution unit that is
 *
 *    + either executed every time before it is otherwise removed `isRecurring === true`
 *    + or executed once before it is automatically removed after execution `isRecurring === false`
 */
interface Task {
  /** the execution callback */
  work: Work;
  /** if false, this task will be removed (not execute again) immediately after it is queued(waiting) for execution*/
  isRecurring: boolean;
}

/**
 * TaskQueue manages a dynamic queue of tasks.
 *
 * The `tasks` array stores all tasks that will be considered for next execution. More specifically, when `TaskQueue.work` is called, an execution unit (an arrow function) will be returned which during execution will execute all tasks according to array order.
 * If a task is one-time (not recurring), it will be removed from the `tasks` array as soon as it is compiled into the execution unit.
 */
export class TaskQueue {
  tasks: Array<Task> = [];

  get work(): (...args: Array<any>) => void {
    const tasks = this.tasks;
    this.tasks = this.tasks.filter(task => task.isRecurring);
    return (...args) => {
      for (const task of tasks) {
        task.work(this, task, ...args);
      }
    };
  }
}
