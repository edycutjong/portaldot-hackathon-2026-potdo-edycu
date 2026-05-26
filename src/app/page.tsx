import { ChatInterface } from "@/components/ChatInterface";
import { Header } from "@/components/Header";
import { CommandHistory } from "@/components/CommandHistory";

export default function Home() {
  return (
    <div className="h-screen flex flex-col grid-bg">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <CommandHistory entries={[]} />
        <main className="flex-1 flex flex-col min-w-0">
          <ChatInterface />
        </main>
      </div>
    </div>
  );
}
