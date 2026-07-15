import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import "../../styles/layout.css";

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />

      <div className="layout">

        <aside className="left-sidebar">
          <Sidebar />
        </aside>

        <main className="main-content">
          {children}
        </main>

        <aside className="right-sidebar">
          <RightSidebar />
        </aside>

      </div>
    </>
  );
};

export default MainLayout;