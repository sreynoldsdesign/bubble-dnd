import {useState} from "react";
import "./BubbleItem.css";

function BubbleItem({ node, onClick, renameNode, deleteNode}) {
  const [isEditing,setIsEditing] = useState(false);
  const [name, setName] = useState(node.name);

  return (
    <div className="bubble" onClick={() => {
      console.log("bubble clicked", {isEditing});
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
            <span>
              {node.name}
            </span>

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
                </>
        )}
    </div>
  );
}

export default BubbleItem;