import { useEffect, useRef } from "react";
import { DetailSheet, TabBar, Toast } from "./components";
import PicksPage from "./pages/Picks";
import ProfileEdit from "./pages/ProfileEdit";
import PointsPage from "./pages/Points";
import { dishes } from "./data";
import { StoreProvider, useStore } from "./store";
import HomePage from "./pages/Home";
import SquarePage from "./pages/Square";
import CollectPage from "./pages/Collect";
import ProfilePage from "./pages/Profile";

function StatusBar() {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between px-7 text-[14px] font-semibold">
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <span className="flex items-end gap-[2px]">
          {[4, 6, 8, 10].map((h) => (
            <span key={h} className="w-[3px] rounded-sm bg-ink" style={{ height: h }} />
          ))}
        </span>
        <span className="relative h-[11px] w-[22px] rounded-[3px] border border-ink/40 p-[1.5px]">
          <span className="block h-full w-[70%] rounded-[1px] bg-ink" />
        </span>
      </span>
    </div>
  );
}

function Shell() {
  const { tab, followedDishes, readUpdates } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const unread = dishes.filter(
    (d) => d.update && followedDishes.includes(d.id) && !readUpdates.includes(d.id),
  ).length;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  return (
    <div className="flex min-h-screen items-center justify-center sm:py-8">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-paper sm:h-[844px] sm:w-[390px] sm:rounded-[48px] sm:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25),0_0_0_10px_#121212]">
        <StatusBar />
        <main ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto">
          {tab === "home" && <HomePage />}
          {tab === "square" && <SquarePage scrollRef={scrollRef} />}
          {tab === "collect" && <CollectPage />}
          {tab === "me" && <ProfilePage />}
        </main>
        <TabBar unread={unread} />
        <PicksPage />
        <ProfileEdit />
        <PointsPage />
        <DetailSheet />
        <Toast />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
