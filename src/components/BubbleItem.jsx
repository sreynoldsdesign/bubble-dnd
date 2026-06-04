import {useState} from "react";
import "./BubbleItem.css";

function BubbleItem({ node, onClick, updateNodeNotes, renameNode, deleteNode, expanded, toggleNode}) {
  const [isEditing,setIsEditing] = useState(false);
  const [name, setName] = useState(node.name);
  const isExpanded = expanded?.[node.id];

  return (
    <div>
      <div className={`bubble ${expanded?.[node.id] ? "expanded" : ""}`} onClick={() => {
        if (!isEditing) onClick();
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