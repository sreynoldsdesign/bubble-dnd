import {useState} from "react";
import Header from "./components/Header";
import BubbleList from "./components/BubbleList";

function App(){
  const initialData = {
    id: "world",
    name: "My World",
    children: [
      {
        id: "continent1",
        name: "Eldoria",
        children: [
          {
            id: "kingdom1",
            name: "Solaris",
            children: []
          }
        ]
      }
    ]
  }
  
  const [currentNode, setCurrentNode] = useState(initialData)
  const [history,setHistory] = useState([])

  function enterNode(node) {
    setHistory([...history,currentNode])
    setCurrentNode(node)
  }

  function goBack(){
    if(history.length === 0) return;

    const prev = history[history.length - 1]
    setHistory(history.slice(0,-1))
    setCurrentNode(prev)
  }

  return(
    <div className="app-container">
      <Header

      />

      <BubbleList
        currentNode={currentNode}
        enterNode={enterNode}
        goBack={goBack}
      />
    </div>
  );
}

export default App;
