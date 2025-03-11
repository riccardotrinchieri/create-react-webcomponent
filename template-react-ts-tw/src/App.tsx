import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-2">
      <h1>React webcomponent</h1>
      <div>
        <button
          className="rounded-full px-4 py-2 bg-black text-white cursor-pointer"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>
      </div>
    </div>
  );
}

export default App;
