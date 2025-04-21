
import Nav from "../components/Nav";

export default function RootLayout({ children }) {
  return (
          <div className="w-[100vw] h-[100vh] flex bg-purple-50">
            <Nav />
            {children}
          </div>
  );
}
