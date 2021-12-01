import { list } from "../../src";

const div = ({ id }, index) => {
  const height = 155;

  const node = document.createElement("div");
  node.className = "item enter";
  node.style.height = height + "px";

  const update = ({ id }, index) => {
    node.textContent = `${index}). Item: ${id}`;
    node.offsetHeight; // force reflow to trigger animation
    node.style.transform = `translate(0, ${(height + 5) * index}px)`;
  };

  update({ id }, index);

  setTimeout(() => {
    node.classList.remove("enter");
  });

  return {
    node,
    update,
    remove(node) {
      node.classList.add("exit");
      node.addEventListener("transitionend", () => node.remove(), {
        once: true,
      });
    },
  };
};

const sync = list(document.getElementById("items"), div);

const input = document.getElementById("data") as HTMLInputElement;
input.addEventListener("keydown", (ev) => {
  if (ev.code === "Enter") {
    updateData();
  }
});

const toId = (id) => ({ id });

const updateData = () => {
  try {
    sync(input.value.split(" ").filter(Boolean).map(toId));
  } catch (e: any) {
    alert(e.message);
  }
};

input.value = "0 1 2";
updateData();
