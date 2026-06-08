import {useState} from "react";
import { useEffect } from "react";
import { useRef } from "react";
import Header from "./components/Header";
import BubbleList from "./components/BubbleList";
import "./App.css";

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
  const containerRef = useRef(null);
  const [newName, setNewName] = useState("")
  
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
    console.log("mousedown fired");
    if (e.target.closest(".bubble")) return;

    setPanning(true);
    setStartPan({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  }

  function handleMouseMove(e) {
    if (!panning) return;
    console.log("mousemove firing");

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

    const zoomFactor = 0.001;
    let newZoom = zoom - e.deltaY * zoomFactor;

    newZoom = Math.max(0.5, Math.min(2, newZoom));

    setZoom(newZoom);
  }

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [panning, startPan]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("wheel", handleWheel, { passive: false});

    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [zoom]);

  const path = getPath(tree, currentNodeId);

  return(
    <div className="app-container">
      <Header
        path={path}
      />

      <div className="controls">
        <input
            placeholder="New location..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if(e.key === "Enter"){
                if (!newName.trim()) return;
                setTree(prev => addNode(prev, currentNodeId, newName))
                setNewName("");
              }
            }}
          />

          <button onClick={() => {
            if(!newName.trim()) return;
            console.log("ADDING TO:", currentNode.id, newName);
            setTree(prev => addNode(prev, currentNodeId, newName))
            setNewName("");
          }}
          >
          Add
          </button>
          
          {currentNode.id !== "world" && (
              <button onClick={goBack}>Back</button>
          )}
      </div>

      <div ref={containerRef} className="canvas-container" onMouseDown={handleMouseDown}  >
        <div className="canvas" style={{transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`}}>
          <BubbleList
            currentNode={currentNode}
            enterNode={enterNode}
            expanded={expanded}
            toggleNode={toggleNode}
            updateNodeNotes={updateNodeNotes}
            updateNodePosition={updateNodePosition}
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
