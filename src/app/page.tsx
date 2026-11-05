import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MenuBook } from "@/components/MenuBook";
import { Visit } from "@/components/Visit";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <MenuBook />
        <Visit />
      </main>
    </>
  );
}
