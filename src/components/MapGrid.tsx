import { useEffect, useRef, useState } from "react";
import { useIslandStore } from "../store/useIsland.store";
import { Layer, Rect, Stage } from "react-konva";
import { CounterCard } from "./CounterCard";

const CELL_SIZE = 20;
const MapGrid = () => {
  const mapGrid = useIslandStore((state) => state.mapGrid);
  const toggleCell = useIslandStore((state) => state.toggleCell);
  const selectionMode = useIslandStore((state) => state.selectionMode);
  const setSelectionMode = useIslandStore((state) => state.setSelectionMode);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null);
  const [cursor, setCursor] = useState<string>("crosshair");
  const stageRef = useRef<any>(null);

  const handleCellClick = (row: number, col: number) => {
    toggleCell(row, col);
  };

  const getRelativePointerPosition = (e: any) => {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    const scale = stage.scaleX();
    return {
      x: (pointer.x - stage.x()) / scale,
      y: (pointer.y - stage.y()) / scale,
    };
  };

  const handleMouseDown = (e: any) => {
    if (selectionMode === "select") {
      const pos = getRelativePointerPosition(e);
      setDragStart(pos);
    }
    setIsDragging(true);
    setCursor(selectionMode === "drag" ? "grabbing" : "crosshair");
  };

  const handleMouseMove = (e: any) => {
    if (selectionMode === "select" && isDragging && dragStart) {
      const pos = getRelativePointerPosition(e);
      setDragEnd(pos);
    }
  };

  const handleMouseUp = () => {
    if (dragStart && dragEnd) {
      const startX = Math.min(dragStart.x, dragEnd.x);
      const startY = Math.min(dragStart.y, dragEnd.y);
      const endX = Math.max(dragStart.x, dragEnd.x);
      const endY = Math.max(dragStart.y, dragEnd.y);

      const startRow = Math.floor(startY / CELL_SIZE);
      const startCol = Math.floor(startX / CELL_SIZE);
      const endRow = Math.floor(endY / CELL_SIZE);
      const endCol = Math.floor(endX / CELL_SIZE);

      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          toggleCell(row, col);
        }
      }
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setCursor(selectionMode === "drag" ? "grab" : "crosshair");
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    stage.scale({ x: newScale, y: newScale });
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyS") {
        setSelectionMode("select");
        setCursor("crosshair");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setSelectionMode("drag");
        setCursor("grab");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [setSelectionMode]);

  return (
    <div style={{ cursor }}>
      <CounterCard />
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        draggable={selectionMode === "drag"}
      >
        <Layer>
          {mapGrid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <Rect
                key={`${rowIndex}-${colIndex}`}
                x={colIndex * CELL_SIZE}
                y={rowIndex * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill={cell === "1" ? "#96b74c" : "#82b9d9"}
                stroke="lightGrey"
                onClick={() => handleCellClick(rowIndex, colIndex)}
              />
            ))
          )}
          {isDragging && dragStart && dragEnd && (
            <Rect
              x={Math.min(dragStart.x, dragEnd.x)}
              y={Math.min(dragStart.y, dragEnd.y)}
              width={Math.abs(dragEnd.x - dragStart.x)}
              height={Math.abs(dragEnd.y - dragStart.y)}
              fill="rgba(0, 255, 0, 0.3)"
              stroke="#96b74c"
              strokeWidth={1}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default MapGrid;
