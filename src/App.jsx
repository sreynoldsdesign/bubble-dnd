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
  const [pan, setPan] = useState({ x: 0, y:0});
  const [panning, setPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x:0, y: 0});
  const [zoom, setZoom] = useState(1);
  
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

  function handleMouseDown(e) {
    if (e.target.closest(".bubble")) return;

    setPanning(true);
    setStartPan({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  }

  function handleMouseMove(e) {
    if (!panning) return;

    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    });
  }

  function handleMouseUp() {
    setPanning(false);
  }

  function updateNodePosition(id, x, y){
    function update(node) {
      if (node.id === id){
        return {...node, x, y};
      }

      return {
        ...node,
        children: node.children.map(update)
      };
    }

    setTree(prev => update(prev));
  }

  function handleWheel(e) {
    e.preventDefault(e);

    const zoomFactor = 0.1;
    let newZoom = zoom - e.deltaY * zoomFactor * 0.01;

    newZoom = Math.max(0.5, Math.min(2, newZoom));

    setZoom(newZoom);
  }

  const path = getPath(tree, currentNodeId);

  return(
    <div className="app-container">
      <Header
        path={path}
      />

      <div className="canvas-container" onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
        <div className="canvas" style={{transform: `translate(${pan.x}px, ${pan.y}px) scale9${zoom})`}}>
          <BubbleList
            currentNode={currentNode}
            enterNode={enterNode}
            goBack={goBack}
            expanded={expanded}
            toggleNode={toggleNode}
            updateNodeNotes={updateNodeNotes}
            updateNodePosition={updateNodePosition}
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
      </div>
    </div>
  );
}

export default App;
