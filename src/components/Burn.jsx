import BurnSection from "./BurnSection";

function Burn() {
  return (
    <div className="fixed inset-0 top-[240px] bottom-[240px] flex items-center justify-center bg-black text-white px-4 text-center">
      <div className="w-full max-w-xl">
        <BurnSection />
      </div>
    </div>
  );
}

export default Burn;
