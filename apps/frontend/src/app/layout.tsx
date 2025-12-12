import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/app/header"
import Footer from "@/app/footer";
import { getUserFromCookie } from "@/app/lib/auth";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "은혜와평강교회",
    description: "정통 복음의 선포와 사랑의 교제가 넘치는 은혜와평강교회 입니다."
};

export default async function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
    const user = await getUserFromCookie();

    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Header user={user}/>
                    <main>
                        {children}
                    </main>
                <Footer />
            </body>
        </html>
    );
}