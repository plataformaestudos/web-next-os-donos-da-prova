import "@/app/global.css";

import { ClientProviders } from "./provider";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import { UserProvider } from "./context/user.context";
import { ThemeWrapper } from "./theme-wrapper";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        template: "%s | Os Donos da Prova",
        default: "Os Donos da Prova",
    },
    description: "Os Donos da Prova concursos",
    metadataBase: new URL("https://www.osdonosdaprova.com.br/"),
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased`}>
                <ClientProviders>
                    <ThemeWrapper>
                        <UserProvider>
                            {children}
                        </UserProvider>
                    </ThemeWrapper>
                </ClientProviders>

            </body>
        </html>
    );
}
