// src/utils/treeUtils.js

export function findNode(node, id) {
    if (node.id === id) return node;
  
    for (let child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  
    return null;
  }
  
  export function addNode(tree, parentId, name) {
    function add(node) {
        console.log("visiting:", node.id);
      if (node.id === parentId) {
        console.log("MATCH FOUND:", node.id);
        return {
          ...node,
          children: [
            ...(node.children || []),
            {
              id: crypto.randomUUID(),
              name,
              notes: "",
              children: []
            }
          ]
        };
      }
  
      return {
        ...node,
        children: (node.children || []).map(add)
      };
    }
  
    return add(tree);
  }
  
  export function renameNode(tree, id, newName) {
    function update(node) {
      if (node.id === id) {
        return { ...node, name: newName };
      }
  
      return {
        ...node,
        children: (node.children || []).map(update)
      };
    }
  
    return update(tree);
  }
  
  export function deleteNode(tree, id) {
    function remove(node) {
      return {
        ...node,
        children: (node.children || [])
          .filter(child => child.id !== id)
          .map(remove)
      };
    }
  
    return remove(tree);
  }