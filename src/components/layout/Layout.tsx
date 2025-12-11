import { type ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
} // LayoutProps là một interface để định nghĩa các props cho component Layout

const Layout = ({ children }: LayoutProps) => { // Layout là một component để hiển thị layout cho trang web
  return ( // return là một hàm để trả về JSX
    <div className="flex min-h-screen flex-col">
      <Header /> // Header là một component để hiển thị header cho trang web
      <main className="flex-1">
        {children}  {/* children là một prop để truyền vào component Layout */}
      </main>
      <Footer /> // Footer là một component để hiển thị footer cho trang web
    </div>
  );
}; // Layout là một component để hiển thị layout cho trang web

export default Layout; // Layout là một component để hiển thị layout cho trang web

