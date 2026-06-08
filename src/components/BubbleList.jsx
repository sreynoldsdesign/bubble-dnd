import { useState } from "react";
import BubbleItem from "./BubbleItem";
import "./BubbleList.css"

function BubbleList({ currentNode, enterNode, expanded, toggleNode, updateNodeNotes, updateNodePosition, renameNode, deleteNode}) {
  

  return (
    <div>
        
        
        {currentNode.children.map(child => (
        <BubbleItem key={child.id} node={child} updateNodePosition={updateNodePosition} onClick={() => enterNode(child)} updateNodeNotes={updateNodeNotes} renameNode={renameNode} deleteNode={deleteNode} expanded={expanded} toggleNode={toggleNode}/>
        ))}
    </div>
  );
}

export default BubbleList;