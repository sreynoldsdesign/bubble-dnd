import { useState } from "react";
import BubbleItem from "./BubbleItem";
import "./BubbleList.css"

function BubbleList({ currentNode, enterNode, goBack, addNode, renameNode, deleteNode}) {
  const [newName, setNewName] = useState("")

  return (
    <div>
        <input
          placeholder="New location..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if(e.key === "Enter"){
              if (!newName.trim()) return;
              addNode(currentNode.id, newName);
              setNewName("");
            }
          }}
        />

        <button onClick={() => {
          if(!newName.trim()) return;
          console.log("ADDING TO:", currentNode.id, newName);
          addNode(currentNode.id, newName);
          setNewName("");
        }}
        >
        Add
        </button>
        
        {currentNode.id !== "world" && (
            <button onClick={goBack}>Back</button>
        )}
        
        {currentNode.children.map(child => (
        <BubbleItem key={child.id} node={child} onClick={() => enterNode(child)} renameNode={renameNode} deleteNode={deleteNode}/>
        ))}
    </div>
  );
}

export default BubbleList;