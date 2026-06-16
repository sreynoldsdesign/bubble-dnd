
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
    x:100,
    y:100,
    size: 120,
    children: [
      {
        id: "continent1",
        name: "Eldoria",
        notes: "",
        x:100,
        y:100,
        size: 120,
        children: [
          {
            id: "kingdom1",
            name: "Solaris",
            notes: "",
            x:100,
            y:100,
            size: 120,
            children: []
          }
        ]
      }
    ]
  }
  const [tree, setTree] = useState(()=> {
    try {
      const saved = localStorage.getItem("tree");
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed?.id ? parsed : initialData;
    } catch {
      return initialData;
    }
  });
  const [currentNodeId, setCurrentNodeId] = useState("world");
  const [history,setHistory] = useState([]);
  const currentNode = findNode(tree,currentNodeId) || tree;
  const [expanded, setExpanded] = useState({});
  const [pan, setPan] = useState({ x: 0, y:0});
  const [panning, setPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x:0, y: 0});
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);
  const [newName, setNewName] = useState("");
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0});
  const [transitionNode, setTransitionNode] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentNodes, setCurrentNodes] = useState([]);
  const [resizingNode, setResizingNode] = useState(null);
  const [resizeStart, setResizeStart] = useState({x:0, y: 0, size: 0});
  const [justResized, setJustResized] = useState(false);
  

  const screenToWorld = (x , y) => {
    return {
      x: (x - pan.x) / zoom,
      y: (y - pan.y) / zoom
    };
  };

  const nodesToRender = isTransitioning ? currentNodes : (currentNode?.children || []);

  const path = getPath(tree, currentNodeId);

  useEffect(() => {
    if (!tree?.id) return;
    localStorage.setItem("tree",JSON.stringify(tree));
  }, [tree]);

  useEffect(() => {
    if(!isTransitioning) {
      setCurrentNodes(currentNode.children || []);
    }
  }, [currentNodeId, isTransitioning, currentNode]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [panning, startPan, draggingNode, dragOffset, pan, zoom, resizingNode, resizeStart]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("wheel", handleWheel, { passive: false});

    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [zoom]);

  
  function enterNode(node) {
    
    setHistory([...history,currentNodeId])
    
    setCurrentNodeId(node.id)
  }

  
  function goBack() {
    if (history.length === 0) return;
  
    const prevId = history[history.length - 1];
  
    setIsTransitioning(true);
  
    const rect = containerRef.current.getBoundingClientRect();

    setZoom(zoom * 0.6);
    setPan({
      x: pan.x + rect.width * 0.2,
      y: pan.y + rect.height * 0.2
    });
  
    setTimeout(() => {
      setHistory(history.slice(0, -1));
      setCurrentNodeId(prevId);
    }, 300);
  
    setTimeout(() => {
      const parentNode = findNode(tree, prevId);
      const children = parentNode?.children || [];
  
      const center = getNodesCenter(children);
  
      const targetZoom = 1.2;
  
      const newPan = {
        x: rect.width / 2 - center.x * targetZoom,
        y: rect.height / 2 - center.y * targetZoom
      };
  
      setPan(newPan);
      setZoom(targetZoom);
    }, 400);
  
    setTimeout(() => {
      setIsTransitioning(false)
      setPan({ x:0, y:0});
      setZoom(1);
    }, 700);
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
    if (resizingNode) {
      const world = screenToWorld(e.clientX, e.clientY);
    
      const dx = world.x - resizeStart.x;
      const dy = world.y - resizeStart.y;
    
      const delta = (dx +dy) * 0.5;
    
      const newSize = Math.max(60, Math.min(300, resizeStart.size + delta));
      updateNodeSizeAndPosition(resizingNode, newSize);

      setResizeStart({
        x: world.x,
        y: world.y,
        size: newSize
      });
    
      return;
    }
    
    if(draggingNode){
      const world = screenToWorld(e.clientX, e.clientY);

      updateNodePosition(
        draggingNode,
        world.x - dragOffset.x,
        world.y - dragOffset.y
      );
      
      return;
    }

    if (!panning) return;

    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    });
  }

  function handleMouseUp() {
    setPanning(false);
    setResizingNode(null);

    setTimeout(() => {
      setJustResized(false);
    }, 50);

    setTimeout(() => {
      setDraggingNode(null);
    }, 50);
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

  function startDraggingNode(e, node) {
    e.stopPropagation();

    const world = screenToWorld(e.clientX, e.clientY);

    setDraggingNode(node.id);

    setDragOffset({
      x: world.x - (node.x || 100),
      y: world.y - (node.y || 100)
    });
  }

  function getNodesCenter(nodes) {
    if(!nodes || nodes.length === 0) return {x:0, y:0};

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    nodes.forEach(node => {
      const x = node.x || 100;
      const y = node.y || 100;

      minX = Math.min(minX,x);
      maxX = Math.max(maxX,x);
      minY = Math.min(minY,y);
      maxY = Math.max(maxY,y);
    });

    return{
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2
    };

  }

  function handleEnterNode(node) {
    if (justResized) return;
    if(draggingNode) return;

    setIsTransitioning(true);
    
    const nodeX = node.x || 100;
    const nodeY = node.y || 100;

    const rect = containerRef.current.getBoundingClientRect();

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const targetZoom = zoom * 3;

    const newPan = {
      x: centerX - nodeX * targetZoom,
      y: centerY - nodeY * targetZoom
    };

    setPan(newPan);
    setZoom(targetZoom);
    setTransitionNode(node);

    setTimeout(() => {
      enterNode(node);
    }, 300);

    setTimeout(() => {
      const rect = containerRef.current.getBoundingClientRect();

      const children = findNode(tree, node.id)?.children || [];

      const center = getNodesCenter(children);

      const targetZoom = 1.2;

      const newPan = {
        x: rect.width / 2 - center.x * targetZoom,
        y: rect.height / 2 - center.y * targetZoom
      };
      
      setPan(newPan);
      setZoom(targetZoom);
    }, 400);

    setTimeout(() => {
      setTransitionNode(null);
      setIsTransitioning(false);
      setPan({ x:0, y:0});
      setZoom(1);
    }, 700);
  }

  function startResizing(e, node) {
    if(resizingNode) return;
    
    e.stopPropagation();

    const world = screenToWorld(e.clientX, e.clientY);

    setResizingNode(node.id);
    setJustResized(true);

    setResizeStart({
      x: world.x,
      y: world.y,
      size: node.size || 120
    });
  }

  function goToNode(nodeId) {
    setCurrentNodeId(nodeId);
    setHistory(prev => {
      const index = prev.indexOf(nodeId);
      return index !== -1 ? prev.slice(0, index) : prev;
    });
  }

  function updateNodeSizeAndPosition(id, newSize){
    function update(node) {
      if(node.id === id) {
        const oldSize = node.size || 120;
        const delta = (newSize - oldSize) /2;

        return {
          ...node,
          size: newSize,
          x: (node.x || 100) - delta,
          y: (node.y || 100) - delta
        };
      }

      return{
        ...node,
        children: node.children.map(update)
      };
    }

    setTree(prev => update(prev));
  }

  return(
    <div className="app-container">
      <Header 
        path={path}
        goToNode={goToNode}
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
        <div className="canvas" style={{transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transition: isTransitioning ? "transform 0.4s ease" : "none"}}>
          <BubbleList
            nodes={nodesToRender}
            enterNode={handleEnterNode}
            transitionNode={transitionNode}
            expanded={expanded}
            toggleNode={toggleNode}
            updateNodeNotes={updateNodeNotes}
            updateNodePosition={updateNodePosition}
            startDraggingNode={startDraggingNode}
            startResizing={startResizing}
            renameNode={(id,newName) =>
              setTree(prev => renameNode(prev, id, newName))
            }
            deleteNode={(id) =>
              setTree(prev => deleteNode(prev,id))
            }
            isTransitioning={isTransitioning}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
