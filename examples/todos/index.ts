import { list } from "../../src";

type Todo = {
  id: number;
  text: string;
  isCompleted: boolean;
};

const todo = (text) => ({
  id: ~~(Math.random() * 1e6),
  text,
  isCompleted: false,
});

let todos = [todo("Drink tea"), todo("Write code")];

const updateTodos = (newTodos) => {
  todos = newTodos;
  sync(todos);
};

const toggleTodo = (id) =>
  updateTodos(
    todos.map((x) => (x.id === id ? { ...x, isCompleted: !x.isCompleted } : x))
  );

const deleteTodo = (id) => updateTodos(todos.filter((x) => x.id !== id));

const sync = list(document.getElementById("todos"), (initialTodo: Todo) => {
  let todo = initialTodo;

  const node = document.createElement("div");
  node.className = "todo";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.onchange = () => toggleTodo(todo.id);
  node.append(checkbox);

  const todoText = document.createElement("span");
  node.append(todoText);

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete";
  deleteButton.textContent = "x";
  deleteButton.onclick = () => deleteTodo(todo.id);
  node.append(deleteButton);

  const update = (_todo: Todo) => {
    todo = _todo;
    todoText.textContent = todo.text;
    todoText.style.textDecoration = todo.isCompleted ? "line-through" : "none";
    checkbox.checked = todo.isCompleted;
  };

  update(initialTodo);

  return { node, update };
});

toggleTodo(todos[0].id);
sync(todos);

document.getElementById("new-todo").onkeydown = (ev: any) => {
  if (ev.code === "Enter") {
    updateTodos(todos.concat(todo(ev.target.value)));
  }
};
