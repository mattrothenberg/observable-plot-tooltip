import { SpendOverTime } from "./charts/spend-over-time";

function App() {
  return (
    <div className="px-8 py-16">
      <div className="h-[200px]">
        <SpendOverTime />
      </div>
      <div className="fixed bottom-4 right-4">
        <a
          className="text-sm inline-flex border-2 border-green-9 rounded-full px-4 py-1.5 text-green-11 hover:shadow-xl hover:shadow-green-a3 font-medium hover:bg-green-a4 transition-all"
          href="https://github.com/mattrothenberg/observable-plot-tooltip"
        >
          View GitHub repo
        </a>
      </div>
    </div>
  );
}

export default App;
