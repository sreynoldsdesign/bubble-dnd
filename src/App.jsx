import {useState} from "react";
import { useEffect } from "react";
import Header from "./components/Header";
import BubbleList from "./components/BubbleList";

import {
  findNode,
  addNode,
  renameNode,
  deleteNode
} from "./treeUtils"

function App(){
  const initialData = {
    id: "world",
    name: "My World",
    notes: "",
    children: [
      {
        id: "continent1",
        name: "Eldoria",
        notes: "",
        children: [
          {
            id: "kingdom1",
            name: "Solaris",
            notes: "",
            children: []
          }
        ]
      }
    ]
  }
  
  const [tree, setTree] = useState(()=> {
    const saved =localStorage.getItem("tree");
    return saved ? JSON.parse(saved) : initialData;
  });
  const [currentNodeId, setCurrentNodeId] = useState("world")
  const [history,setHistory] = useState([])
  const currentNode = findNode(tree,currentNodeId);
  const [expanded, setExpanded] = useState({});
  
  useEffect(() => {
    const saved = localStorage.getItem("tree");
    if(saved){
      setTree(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tree",JSON.stringify(tree));
  }, [tree]);

  function enterNode(node) {
    setHistory([...history,currentNodeId])
    setCurrentNodeId(node.id)
  }

  function goBack(){
    if(history.length === 0) return;

    const prevId = history[history.length - 1]
    setHistory(history.slice(0,-1))
    setCurrentNodeId(prevId)
  }

  function getPath(tree, id, path =[]){
    if(tree.id === id) return [...path,tree];

    for (let child of tree.children){
      const result = getPath(child, id, [...path, tree]);
        if (result) return result;
    }

    return null;
  }

  function toggleNode(id){
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  function updateNodeNotes(id, notes) {
    function update(node) {
      if (node.id === id) {
        return {...node, notes};
      }

      return {
        ...node,
        children: node.children.map(update)
      };
    }

    setTree(prev => update(prev));
  }

  const path = getPath(tree, currentNodeId);

  return(
    <div className="app-container">
      <Header
        path={path}
      />

      <BubbleList
        currentNode={currentNode}
        enterNode={enterNode}
        goBack={goBack}
        expanded={expanded}
        toggleNode={toggleNode}
        updateNodeNotes={updateNodeNotes}
        addNode={(parentId,name) =>
          setTree(prev => addNode(prev, parentId, name))
        }
        renameNode={(id,newName) =>
          setTree(prev => renameNode(prev, id, newName))
        }
        deleteNode={(id) =>
          setTree(prev => deleteNode(prev,id))
        }
      />
    </div>
  );
}

export default App;
