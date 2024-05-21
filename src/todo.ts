

export type Todo = {
    id: string;
    text: string;
    isDone: boolean;
};

export type TodoStore = {
    getAll: () => Todo[];
    addOrUpdate: (todo: Todo) => void;
    remove: (id: string) => void;
};

export function createTodoStore(){

    const todos: Todo[] = [];

    return {
        getAll: () => [...todos],
        addOrUpdate: (todo: Todo) => {
            const index = todos.findIndex(({ id }) => id === todo.id);

            if (index === -1) {
                todos.push(todo);
            } else {
                todos[index] = todo;
            }
        },
        remove: (id: string) => {
            const index = todos.findIndex(({ id: todoId }) => todoId === id);

            if (index === -1) {
                return;
            }

            todos.splice(index, 1);
        }
    };

}

const todoStoreByUserId = new Map<string, TodoStore>();

export function getUserTodoStore(userId: string): TodoStore {

    if (!todoStoreByUserId.has(userId)) {
        todoStoreByUserId.set(userId, createTodoStore());
    }

    return todoStoreByUserId.get(userId)!;

}