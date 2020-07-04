import { TaskQueue } from "./TaskQueue";

describe("Task Queue", () => {
  test("recurring task", () => {
    let sum = 0;
    const taskQueue = new TaskQueue();
    taskQueue.tasks.push({
      work: () => sum += 1,
      isRecurring: true
    });

    // execute once
    taskQueue.work();
    expect(sum).toBe(1);
    expect(taskQueue.tasks.length).toBe(1);

    // recurring task can be executed multiple times
    taskQueue.work();
    expect(sum).toBe(2);
  });

  test("one-time task", () => {
    let sum = 0;
    const taskQueue = new TaskQueue();
    taskQueue.tasks.push({
      work: () => sum += 1,
      isRecurring: false
    });

    // execute once
    taskQueue.work();
    expect(sum).toBe(1);
    expect(taskQueue.tasks.length).toBe(0);

    // no task will be executed since queue is empty
    taskQueue.work();
    expect(sum).toBe(1);
  });
});
