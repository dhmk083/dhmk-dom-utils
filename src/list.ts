const defaultKey = (x) => ("id" in x ? x.id : x);

function checkKey(map, key) {
  if (map.has(key))
    throw new Error("Found two items with the same key: " + key);
}

function toMap(data, getKey) {
  const map = new Map();

  for (let i = 0; i < data.length; i++) {
    const key = getKey(data[i]);

    checkKey(map, key);
    map.set(key, i);
  }

  return map;
}

type Instance<T = any> = {
  node: Element;
  data: T;
  index: number;
  update(data: T, index: number);
  dispose();
  insert(parent: Element, node: Element, ref: Element | null);
  remove(node: Element);
};

type Child<T> = Partial<Readonly<Omit<Instance<T>, "data" | "index">>>;

export function list<T>(
  parent: Element,
  childFactory: (data: T, index: number) => Child<T>,
  getKey: (data: T) => any = defaultKey
) {
  if (parent.children.length) throw new Error("Parent element is not empty.");

  let oldInstances: Instance[] = [];

  return (newData: ReadonlyArray<T>) => {
    const oldData = oldInstances.map((x) => x.data);
    const oldCount = oldData.length;
    const newCount = newData.length;

    const oldMap = toMap(oldData, getKey);
    const newMap = toMap(newData, getKey);

    const newInstances: Instance[] = [];

    let oldi = 0;
    let newi = 0;

    while (true) {
      if (oldi === oldCount) {
        // insert new or move

        for (; newi < newCount; newi++) {
          const data = newData[newi];
          const oldInstance = oldInstances[oldMap.get(getKey(data))];

          if (oldInstance) {
            oldInstance.insert(parent, oldInstance.node, null);
            update(oldInstance, newData[newi], newi);
            newInstances.push(oldInstance);
          } else {
            const instance = enter(childFactory, data, newi);
            instance.insert(parent, instance.node, null);
            newInstances.push(instance);
          }
        }
        break;
      }

      if (newi === newCount) {
        // remove

        for (; oldi < oldCount; oldi++) {
          if (newMap.has(getKey(oldData[oldi]))) continue; // it's a moved node

          exit(oldInstances[oldi]);
        }
        break;
      }

      const oldInst = oldInstances[oldi];

      const oldKey = getKey(oldData[oldi]);
      const newKey = getKey(newData[newi]);

      if (oldKey === newKey) {
        update(oldInst, newData[newi], newi);
        newInstances.push(oldInst);

        oldi++;
        newi++;
      } else {
        const oldItem_newIndex = newMap.get(oldKey);

        if (oldItem_newIndex < newi) {
          oldi++;
          continue;
        }

        if (oldItem_newIndex === undefined) {
          // remove (exit)

          exit(oldInst);
          oldi++;
          continue;
        }

        const newItem_oldIndex = oldMap.get(newKey);

        if (newItem_oldIndex === undefined) {
          // insert (enter)

          const instance = enter(childFactory, newData[newi], newi);
          instance.insert(parent, instance.node, oldInst.node);
          newInstances.push(instance);
          newi++;
          continue;
        }

        const removeCost = newItem_oldIndex - oldi;
        const insertCost = oldItem_newIndex - newi;

        if (insertCost < removeCost) {
          // insert (move)

          const oldNewInst = oldInstances[newItem_oldIndex];
          oldNewInst.insert(parent, oldNewInst.node, oldInst.node);
          update(oldNewInst, newData[newi], newi);
          newInstances.push(oldNewInst);
          newi++;
          continue;
        } else {
          // remove (move)

          oldi++;
          continue;
        }
      }
    }

    oldInstances = newInstances;
  };
}

const noop = () => {};

function enter(childFactory, data, index) {
  return {
    data,
    index,
    update: noop,
    dispose: noop,
    insert,
    remove,
    ...childFactory(data, index),
  };
}

function insert(parent, node, ref) {
  parent.insertBefore(node, ref);
}

function remove(node) {
  node.remove();
}

function update(instance, data, index) {
  if (instance.index === index && instance.data === data) return;

  instance.index = index;
  instance.data = data;
  instance.update(data, index);
}

function exit(instance) {
  instance.dispose();
  instance.remove(instance.node);
}
