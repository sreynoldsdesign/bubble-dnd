import { useState, useEffect, useRef } from "react";

export default function useCanvasInteraction({
    pan,
    setPan,
    zoom,
    setZoom,
    updateNodePosition,
    updateNodeSizeAndPosition,
    onNodeClick,
    setDragPreview
}) {
  

    const MODE = {
        IDLE: "idle",
        PANNING: "panning",
        PRESSING_NODE: "pressing_node",
        DRAGGING_NODE: "dragging_node",
        RESIZING_NODE: "resizing_node",
    };
    const modeRef= useRef(MODE.IDLE);
    const interactionRef = useRef({
        nodeId: null,
        start: null,
        offset: null,
        size: null,
        moved: false,
        lastPosition: null
    });

    const screenToWorld = (x, y) => {
        return {
          x: (x - pan.x) / zoom,
          y: (y - pan.y) / zoom
        };
      };


    function handleMouseDown(e) {
        if (e.target.closest(".bubble")) return;

        modeRef.current = MODE.PANNING;
    
        interactionRef.current.start = {
          x: e.clientX - pan.x,
          y: e.clientY - pan.y
        };

        interactionRef.current.offset = {
            x: e.clientX - pan.x,
            y: e.clientY - pan.y
          };
    }

    function handleMouseMove(e) {
       if(modeRef.current=== MODE.IDLE) return;
       
        const {start, offset} = interactionRef.current;

        if (modeRef.current === MODE.PRESSING_NODE) {
            const dx = e.clientX - interactionRef.current.startScreenX;
            const dy = e.clientY - interactionRef.current.startScreenY;
        
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                modeRef.current = MODE.DRAGGING_NODE;
        
                const world = screenToWorld(e.clientX, e.clientY);
        
                interactionRef.current.offset = {
                    x: world.x - (interactionRef.current.node.x || 100),
                    y: world.y - (interactionRef.current.node.y || 100)
                };
            }
        }
        
        if (modeRef.current === MODE.PANNING) {
            setPan({
                x: e.clientX - offset.x,
                y: e.clientY - offset.y
            });
            return;
        }

        if (modeRef.current === MODE.DRAGGING_NODE) {
            
            const world = screenToWorld(e.clientX, e.clientY);

            const { nodeId, offset} = interactionRef.current;

            const x = world.x - offset.x;
            const y = world.y - offset.y;

            interactionRef.current.lastPosition = {x,y};

            setDragPreview({nodeId,x,y});
        }

        if (modeRef.current === MODE.RESIZING_NODE) {
            const world = screenToWorld(e.clientX, e.clientY);

            const nodeId = interactionRef.current.nodeId;
            const startSize = interactionRef.current.size;

            const dx = world.x - start.x;
            const dy = world.y - start.y;

            const delta = (dx + dy) * 0.5;

            updateNodeSizeAndPosition(nodeId, startSize + delta);
        }
      }

    function handleMouseUp() {

        console.log("MOUSE UP MODE:", modeRef.current);
        if (modeRef.current === MODE.DRAGGING_NODE) {
            const {nodeId, lastPosition} = interactionRef.current;

            if(nodeId && lastPosition) {
                updateNodePosition(nodeId, lastPosition.x, lastPosition.y);
            }

            setDragPreview(null);
        }
        
        if(modeRef.current === MODE.PRESSING_NODE && interactionRef.current.node) {
            onNodeClick?.(interactionRef.current.node);
        }

        modeRef.current = MODE.IDLE;

        interactionRef.current = {
            nodeId: null,
            node: null,
            start: null,
            offset: null,
            size: null,
            moved: false
        };
    }

    function startDraggingNode(e, node) {
        e.stopPropagation();
    
        modeRef.current = MODE.PRESSING_NODE;

        const world = screenToWorld(e.clientX, e.clientY);

        interactionRef.current = {
            nodeId: node.id,
            node,
            startScreenX: e.clientX,
            startScreenY: e.clientY,
            moved: false
        };

        interactionRef.current.offset = {
            x: world.x - (node.x || 100),
            y: world.y - (node.y || 100)
        };

        const dx = e.clientX - interactionRef.current.startScreenX;
        const dy = e.clientY - interactionRef.current.startScreenY;

        if (Math.hypot(dx, dy) > 5) {
            modeRef.current = MODE.DRAGGING_NODE;
        }
    }
    
    function startResizing(e, node) {
    
        e.stopPropagation();

        modeRef.current = MODE.RESIZING_NODE;
    
        const world = screenToWorld(e.clientX, e.clientY);

        interactionRef.current.nodeId = node.id;
        interactionRef.current.start = world;
        interactionRef.current.size = node.size || 120;
    }

    const handlersRef = useRef();

handlersRef.current = {
  handleMouseMove,
  handleMouseUp
};

useEffect(() => {
  const move = (e) => handlersRef.current.handleMouseMove(e);
  const up = (e) => handlersRef.current.handleMouseUp(e);

  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);

  return () => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
  };
}, []);

    return {
        handleMouseDown,
        startDraggingNode,
        startResizing
    };
}