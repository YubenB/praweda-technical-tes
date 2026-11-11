import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Soal 4 - Randomuser",
  description: "User list from randomuser.me",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={poppins.variable}>
      <body>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: { fontFamily: "var(--font-poppins), Arial, sans-serif", borderRadius: 8 },
              components: { Table: { headerBg: "#fafafa", headerColor: "#8c8c8c" } },
            }}
          >
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
