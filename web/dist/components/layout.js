import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut, Github, Puzzle, Bot, LayoutDashboard, User, Shield, Bug } from "lucide-react";
import { api } from "../lib/api";
const navItems = [
    { path: "/dashboard", icon: Bot, label: "Bot 管理" },
    { path: "/dashboard/webhook-plugins", icon: Puzzle, label: "Webhook 插件" },
    { path: "/dashboard/webhook-plugins/debug", icon: Bug, label: "插件调试" },
];
const bottomItems = [
    { path: "/dashboard/settings", icon: User, label: "账号设置" },
    { path: "/dashboard/admin", icon: Shield, label: "系统管理", adminOnly: true },
];
export function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    useEffect(() => {
        api.me().then(setUser).catch(() => navigate("/login", { replace: true }));
    }, []);
    if (!user)
        return null;
    async function handleLogout() {
        await api.logout();
        navigate("/login", { replace: true });
    }
    function isActive(path) {
        if (path === "/dashboard")
            return location.pathname === "/dashboard" || location.pathname.startsWith("/dashboard/bot/");
        if (path === "/dashboard/webhook-plugins")
            return location.pathname === "/dashboard/webhook-plugins";
        return location.pathname.startsWith(path);
    }
    function renderNav(items) {
        return items.map((item) => {
            if (item.adminOnly && user.role !== "admin")
                return null;
            const active = isActive(item.path);
            return (_jsxs(Link, { to: item.path, className: `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${active ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`, children: [_jsx(item.icon, { className: "w-4 h-4" }), item.label] }, item.path));
        });
    }
    return (_jsxs("div", { className: "h-screen flex", children: [_jsxs("aside", { className: "w-52 border-r flex flex-col shrink-0 h-screen sticky top-0", children: [_jsx("div", { className: "px-4 py-4 border-b shrink-0", children: _jsxs(Link, { to: "/dashboard", className: "flex items-center gap-2 hover:opacity-80", children: [_jsx(LayoutDashboard, { className: "w-5 h-5 text-primary" }), _jsx("span", { className: "font-semibold text-sm", children: "OpenILink Hub" })] }) }), _jsx("nav", { className: "flex-1 px-2 py-3 space-y-0.5 overflow-y-auto", children: renderNav(navItems) }), _jsx("div", { className: "border-t px-2 py-2 space-y-0.5 shrink-0", children: renderNav(bottomItems) }), _jsxs("div", { className: "border-t px-3 py-3 space-y-2 shrink-0", children: [_jsxs("div", { className: "flex items-center gap-2 px-1", children: [_jsx("div", { className: "w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-medium", children: user.username.charAt(0).toUpperCase() }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs font-medium truncate", children: user.username }), _jsx("p", { className: "text-[10px] text-muted-foreground", children: user.role === "admin" ? "管理员" : "成员" })] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsxs("a", { href: "https://github.com/openilink/openilink-hub", target: "_blank", rel: "noopener", className: "flex-1 flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-foreground py-1 rounded hover:bg-secondary/50 transition-colors", children: [_jsx(Github, { className: "w-3 h-3" }), " GitHub"] }), _jsxs("button", { onClick: handleLogout, className: "flex-1 flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-foreground py-1 rounded hover:bg-secondary/50 transition-colors cursor-pointer", children: [_jsx(LogOut, { className: "w-3 h-3" }), " \u9000\u51FA"] })] })] })] }), _jsx("main", { className: "flex-1 overflow-auto h-screen", children: _jsx("div", { className: "max-w-4xl mx-auto p-6", children: _jsx(Outlet, {}) }) })] }));
}
