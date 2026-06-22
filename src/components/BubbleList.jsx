import BubbleItem from "./BubbleItem";
import "./BubbleList.css"

function BubbleList({ nodes, enterNode, transitionNode, expanded, toggleNode, dragPreview, updateNodeNotes, startResizing, updateNodePosition, startDraggingNode, renameNode, deleteNode, isTransitioning}) {
  

  return (
    <div className={`bubble-layer ${isTransitioning ? "fade-out" : ""}`}>
        {nodes.map(child => (
        <BubbleItem key={child.id} node={child} onClick={() => enterNode(child)} updateNodeNotes={updateNodeNotes} renameNode={renameNode} deleteNode={deleteNode} expanded={expanded} toggleNode={toggleNode} startDraggingNode={startDraggingNode} dragPreview = {dragPreview} transitionNode={transitionNode} startResizing={startResizing}/>
        ))}
    </div>
  );
}

export default BubbleList;