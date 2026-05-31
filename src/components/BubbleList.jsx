import BubbleItem from "./BubbleItem";

function BubbleList({ currentNode, enterNode, goBack}) {
  return (
    <div>
        {currentNode.id !== "world" && (
            <button onClick={goBack}>Back</button>
        )}
        
        {currentNode.children.map(child => (
        <BubbleItem key={child.id} node={child} onClick={() => enterNode(child)} />
        ))}
    </div>
  );
}

export default BubbleList;