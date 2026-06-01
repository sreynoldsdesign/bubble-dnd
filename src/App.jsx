import {useState} from "react";
import Header from "./components/Header";
import BubbleList from "./components/BubbleList";

function App(){
  const initialData = {
    id: "world",
    name: "My World",
    children: [
      {
        id: "continent1",
        name: "Eldoria",
        children: [
          {
            id: "kingdom1",
            name: "Solaris",
            children: []
          }
        ]
      }
    ]
  }
  
  const [tree, setTree] = useState(initialData)
  const [currentNodeId, setCurrentNodeId] = useState("world")
  const [history,setHistory] = useState([])
  const currentNode = findNode(tree,currentNodeId);
  

  function enterNode(node) {
    setHistory([...history,currentNodeId])
    setCurrentNodeId(node.id)
  }

  function findNode(node, id){
    if(node.id === id) return node;

    for (let child of node.children){
      const found = findNode(child,id);
      if (found) return found;
    }

    return null;
  }

  function goBack(){
    if(history.length === 0) return;

    const prevId = history[history.length - 1]
    setHistory(history.slice(0,-1))
    setCurrentNodeId(prevId)
  }

  function addNode(parentId, name) {
    function addRecursive(node){
      if (node.id === parentId) {
        return {
          ...node,
          children: [
            ...node.children,
            {
              id: crypto.randomUUID(),
              name,
              children: []
            }
          ]
        };
      }

      return {
        ...node,
        children: node.children.map(addRecursive)
      };
    }

    setTree(addRecursive(tree));
  }

  function renameNode(id, newName){
    function update(node){
      if(node.id === id){
        return {...node, name: newName};
      }

      return{
        ...node,
        children: node.children.map(update)
      };
    }

    setTree(update(tree));
  }

  function deleteNode(id) {
    function remove(node) {
      return {
        ...node,
        children: node.children
          .filter(child => child.id !== id)
          .map(remove)
      };
    }

    setTree(remove(tree));
  }

  return(
    <div className="app-container">
      <Header

      />

      <BubbleList
        currentNode={currentNode}
        enterNode={enterNode}
        goBack={goBack}
        addNode={addNode}
        renameNode={renameNode}
        deleteNode={deleteNode}
      />
    </div>
  );
}

export default App;
