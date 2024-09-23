import { OffersTable } from "@/components/molecules/offers/table";

export default function Home() {
  return (
    <main className="flex h-dvh flex-col items-center bg-black text-white">
      <div className="w-full max-w-[748px] h-full py-5 px-5 lg:px-0 flex flex-col">
        <OffersTable />
      </div>
    </main>
  );
}
