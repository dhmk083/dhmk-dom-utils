# @dhmk/dom-utils

A collection of DOM related utils.

### `list<T>(parent: Element, childFactory: (data: T, index: number) => Child, getKey?: (data: T) => Key): (newData: T[]) => void`

```ts
type Child<T> = {
  node: Element;
  update?: (data: T, index: number) => void;
  dispose?: () => void;
  insert?: (parent: Element, node: Element, ref: Element | null) => void;
  remove?: (node: Element) => void;
};

const defaultKey = (x) => ("id" in x ? x.id : x);
```

Syncs data list with DOM elements.

Usage:

```ts
const sync = list(document.getElementById("items"), (data) => {
  const node = document.createElement('div')
  // ...set up node

  return {
    node, // required

    // optional:

    update(newData, index) {} // called when a data item with the same key is updated
    dispose() {} // called when a new data list doesn't contain an item with the key
    insert(parent, node, refNode) {} // customize node insertion; default: parent.insertBefore(node, refNode)
    remove(node) {} // customize node deletion; default: node.remove()
  }
})

sync([1, 2, 3]) // inserts nodes
sync([3, 1]) // moves `3` and deletes `2`
```
