import { useIslandStore } from "../store/useIsland.store";
import IslandIcon from "../assets/island-icon.svg";

export const CounterCard = () => {
  const numberOfIslands = useIslandStore((state) => state.numberOfIslandSelector(state));
  return (
    <div className="counter-card">
      <div>
        <img src={IslandIcon} alt="Island with beach" style={{ width: "4em" }} />
        <h3 className="counter-label">{numberOfIslands}</h3>
      </div>
      <p>Press ⎵ to pan and S to select cells. 😊</p>
    </div>
  );
};
