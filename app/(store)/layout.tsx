import Script from "next/script";
import Header from "./components/header";
import Footer from "./components/Footer";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div className="min-h-screen flex flex-col overflow-x-hidden ">
        <Header />
        <div className="w-full flex-1">{children}</div>
        <Footer />
      </div>
    </>
  );
}
