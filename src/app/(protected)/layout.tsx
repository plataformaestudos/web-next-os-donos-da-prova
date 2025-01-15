import { Header } from "@/ui/header/header.component";
import { Navbar } from "@/ui/navbar/navbar.component";
import { NavbarContextProvider } from "@/ui/navbar/navbar.context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavbarContextProvider>
      <div className="w-screen h-screen flex relative">
        <Navbar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex items-center justify-center border border-blue-500 sm:border-red-500 flex-1">
            {children}
          </div>
        </div>
      </div>
    </NavbarContextProvider>
  );
}
