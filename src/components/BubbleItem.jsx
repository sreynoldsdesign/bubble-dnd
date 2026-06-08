import {useState} from "react";
import { useEffect } from "react";
import "./BubbleItem.css";

function BubbleItem({ node, updateNodePosition, onClick, updateNodeNotes, renameNode, deleteNode, expanded, toggleNode}) {
  const [isEditing,setIsEditing] = useState(false);
  const [name, setName] = useState(node.name);
  const isExpanded = expanded?.[node.id];
  const [dragging,setDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [startPos, setStartPos] = useState({x:0, y:0});

  console.log("BubbleItem render:", node.id, node.x, node.y);

  function handleMouseDown(e){
    e.stopPropagation();

    setDragging(true);
    setHasMoved(false);
    setStartPos({ x: e.clientX, y: e.clientY});
  }

  function handleMouseMove(e){
    if(!dragging) return;

    const dx = Math.abs(e.clientX - startPos.x);
    const dy = Math.abs(e.clientY - startPos.y);

    if (dx >2 || dy > 2){
      setHasMoved(true);
      updateNodePosition(node.id, e.clientX,e.clientY);
    }
  }

  function handleMouseUp() {
    setDragging(false);
  }

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup",handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  return (
    <div>
      <div className={`bubble ${expanded?.[node.id] ? "expanded" : ""}`} style={{position: "absolute", left: node.x || 100, top: node.y || 100}} onMouseDown={(e) => {e.stopPropagation(); handleMouseDown(e);}} onClick={() => {
        if (isEditing) return;
        if (hasMoved) return;
        onClick();
      }}
      >
          {isEditing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                renameNode(node.id,name)
                setIsEditing(false)
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              />
            ):(
              <>
              <span className="bubble-title">
                {node.name}
              </span>

              <button onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}>
                {expanded?.[node.id] ? "▲":"▼"}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                >
                  ✏️
                  </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(node.id);
                }}
                >
                  🗑
                  </button>

                  {expanded?.[node.id] && (
                  <textarea
                    className="bubble-notes"
                    value={node.notes || ""}
                    onChange={(e) => updateNodeNotes(node.id, e.target.value)}
                    placeholder="Write notes here..."
                    onClick={(e) => e.stopPropagation()}
                  />
                  )}
                  </>
          )}
      </div>
      
    </div>
  );
}

export default BubbleItem;