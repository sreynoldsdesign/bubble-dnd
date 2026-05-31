import "./BubbleItem.css";

function BubbleItem({ node, onClick }) {
  return (
    <div className="bubble" onClick={onClick}>
      {node.name}
    </div>
  );
}

export default BubbleItem;