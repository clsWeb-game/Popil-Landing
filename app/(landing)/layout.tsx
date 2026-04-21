import Footer from "./components/footer";
import Header from "./components/header";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {
        <div className="min-h-screen flex flex-col overflow-x-hidden">
          <Header />
          <div className="relative ">{children}</div>
          {/* <Footer /> */}
        </div>
      }
    </>
  );
}
