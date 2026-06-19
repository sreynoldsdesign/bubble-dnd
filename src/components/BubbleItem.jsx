import {useState} from "react";
import "./BubbleItem.css";

function BubbleItem({ node, onClick, updateNodeNotes, renameNode, deleteNode, expanded, toggleNode, startDraggingNode, transitionNode, startResizing,}) {
  const [isEditing,setIsEditing] = useState(false);
  const [name, setName] = useState(node.name);
  const isTransitioningNode = transitionNode?.id === node.id;

  return (
    <div>
      <div className={`bubble ${expanded?.[node.id] ? "expanded" : ""}`} style={{position: "absolute",width: node.size || 120, height: node.size || 120, left: node.x || 100, top: node.y || 100, transform: isTransitioningNode ? "scale(1.5)":"scale(1)", transition: "transform 0.4s ease"}} onMouseDown={(e) => {startDraggingNode(e, node);}}>
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
              <div className="resize-handle" onMouseDown={(e) => {e.stopPropagation(); startResizing(e,node);}}></div>
              <div className="bubble-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  ✏️
                </button>

                <button onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.id);
                }}>
                  {expanded?.[node.id] ? "▲":"▼"}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node.id);
                  }}
                >
                  🗑
                </button>
              </div>
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