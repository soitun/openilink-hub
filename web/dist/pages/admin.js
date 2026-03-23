import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { api } from "../lib/api";
import { Save, Trash2, Check, X, Shield, Github } from "lucide-react";
const providerLabels = { github: "GitHub", linuxdo: "LinuxDo" };
const providerCallbackHelp = {
    github: "在 github.com/settings/developers → OAuth Apps 中创建应用",
    linuxdo: "在 connect.linux.do 中创建应用",
};
export function AdminPage() {
    const [tab, setTab] = useState("dashboard");
    const [pendingCount, setPendingCount] = useState(0);
    useEffect(() => {
        api.listPlugins("pending").then((l) => setPendingCount((l || []).length)).catch(() => { });
    }, [tab]);
    const tabs = [
        { key: "dashboard", label: "概览" },
        { key: "users", label: "用户" },
        { key: "plugins", label: `插件审核${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
        { key: "system", label: "系统" },
        { key: "ai", label: "AI" },
        { key: "oauth", label: "OAuth" },
    ];
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-lg font-semibold", children: "\u7CFB\u7EDF\u7BA1\u7406" }), _jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "\u7528\u6237\u3001\u63D2\u4EF6\u5BA1\u6838\u3001\u7CFB\u7EDF\u914D\u7F6E" })] }), _jsx("div", { className: "flex border rounded-lg overflow-hidden w-fit", children: tabs.map((t) => (_jsx("button", { className: `px-3 py-1.5 text-xs cursor-pointer ${tab === t.key ? "bg-secondary font-medium" : "text-muted-foreground"}`, onClick: () => setTab(t.key), children: t.label }, t.key))) }), tab === "dashboard" && _jsx(DashboardTab, {}), tab === "users" && _jsx(UsersTab, {}), tab === "plugins" && _jsx(PluginReviewTab, {}), tab === "system" && _jsx(SystemTab, {}), tab === "ai" && _jsx(AITab, {}), tab === "oauth" && _jsx(OAuthTab, {})] }));
}
// ==================== Dashboard ====================
function DashboardTab() {
    const [stats, setStats] = useState(null);
    useEffect(() => {
        api.adminStats().then(setStats).catch(() => { });
        const t = setInterval(() => api.adminStats().then(setStats).catch(() => { }), 10000);
        return () => clearInterval(t);
    }, []);
    if (!stats)
        return null;
    const items = [
        { label: "用户", value: stats.total_users, sub: `${stats.active_users} 活跃` },
        { label: "Bot", value: stats.total_bots, sub: `${stats.online_bots} 在线${stats.expired_bots > 0 ? ` / ${stats.expired_bots} 过期` : ""}` },
        { label: "渠道", value: stats.total_channels },
        { label: "WebSocket", value: stats.connected_ws, sub: "在线连接" },
        { label: "总消息", value: stats.total_messages.toLocaleString(), sub: `${stats.inbound_messages.toLocaleString()} 入 / ${stats.outbound_messages.toLocaleString()} 出` },
    ];
    return (_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: items.map((item) => (_jsxs("div", { className: "p-4 rounded-lg border bg-card text-center", children: [_jsx("p", { className: "text-2xl font-bold", children: item.value }), _jsx("p", { className: "text-xs text-muted-foreground", children: item.label }), item.sub && _jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: item.sub })] }, item.label))) }));
}
// ==================== Users ====================
function UsersTab() {
    const [users, setUsers] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRole, setNewRole] = useState("member");
    const [error, setError] = useState("");
    const [generatedPwd, setGeneratedPwd] = useState(null);
    async function load() { try {
        setUsers(await api.listUsers() || []);
    }
    catch { } }
    useEffect(() => { load(); }, []);
    async function handleCreate(e) {
        e.preventDefault();
        setError("");
        if (!newUsername.trim() || newPassword.length < 8) {
            setError("用户名必填，密码至少 8 位");
            return;
        }
        try {
            await api.createUser({ username: newUsername.trim(), password: newPassword, role: newRole });
            setNewUsername("");
            setNewPassword("");
            setShowCreate(false);
            load();
        }
        catch (err) {
            setError(err.message);
        }
    }
    async function handleToggleRole(user) {
        const r = user.role === "admin" ? "member" : "admin";
        if (!confirm(`将 ${user.username} 改为 ${r === "admin" ? "管理员" : "成员"}？`))
            return;
        try {
            await api.updateUserRole(user.id, r);
            load();
        }
        catch (err) {
            setError(err.message);
        }
    }
    async function handleToggleStatus(user) {
        const s = user.status === "active" ? "disabled" : "active";
        if (!confirm(`${s === "disabled" ? "禁用" : "启用"} ${user.username}？`))
            return;
        try {
            await api.updateUserStatus(user.id, s);
            load();
        }
        catch (err) {
            setError(err.message);
        }
    }
    async function handleResetPassword(user) {
        if (!confirm(`重置 ${user.username} 的密码？将生成随机密码。`))
            return;
        try {
            const result = await api.resetUserPassword(user.id);
            setGeneratedPwd({ username: user.username, password: result.password });
        }
        catch (err) {
            setError(err.message);
        }
    }
    async function handleDelete(user) {
        if (!confirm(`永久删除 ${user.username}？不可撤销。`))
            return;
        try {
            await api.deleteUser(user.id);
            load();
        }
        catch (err) {
            setError(err.message);
        }
    }
    return (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "flex justify-end", children: _jsx(Button, { variant: "outline", size: "sm", className: "text-xs h-7", onClick: () => setShowCreate(!showCreate), children: showCreate ? "取消" : "创建用户" }) }), error && _jsx("p", { className: "text-[10px] text-destructive", children: error }), showCreate && (_jsxs("form", { onSubmit: handleCreate, className: "p-3 rounded-lg border bg-card space-y-2", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: "\u7528\u6237\u540D", value: newUsername, onChange: (e) => setNewUsername(e.target.value), className: "h-7 text-xs" }), _jsx(Input, { type: "password", placeholder: "\u5BC6\u7801\uFF08\u81F3\u5C11 8 \u4F4D\uFF09", value: newPassword, onChange: (e) => setNewPassword(e.target.value), className: "h-7 text-xs" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex gap-1", children: ["member", "admin"].map((r) => (_jsx("button", { type: "button", onClick: () => setNewRole(r), className: `px-2 py-0.5 text-[10px] rounded cursor-pointer ${newRole === r ? "bg-primary text-primary-foreground" : "bg-secondary"}`, children: r === "admin" ? "管理员" : "成员" }, r))) }), _jsx(Button, { type: "submit", size: "sm", className: "h-7 text-xs", children: "\u521B\u5EFA" })] })] })), _jsx("div", { className: "space-y-1", children: users.map((u) => (_jsxs("div", { className: "flex items-center justify-between p-2.5 rounded-lg border bg-card", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-medium", children: u.username.charAt(0).toUpperCase() }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-xs font-medium", children: u.username }), _jsx("span", { className: `text-[10px] px-1 rounded ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`, children: u.role === "admin" ? "管理员" : "成员" }), u.status === "disabled" && _jsx("span", { className: "text-[10px] px-1 rounded bg-destructive/10 text-destructive", children: "\u5DF2\u7981\u7528" })] }), u.email && _jsx("p", { className: "text-[10px] text-muted-foreground", children: u.email })] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => handleToggleRole(u), className: "text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-secondary cursor-pointer", children: u.role === "admin" ? "降级" : "升级" }), _jsx("button", { onClick: () => handleToggleStatus(u), className: "text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-secondary cursor-pointer", children: u.status === "active" ? "禁用" : "启用" }), _jsx("button", { onClick: () => handleResetPassword(u), className: "text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-secondary cursor-pointer", children: "\u91CD\u7F6E\u5BC6\u7801" }), _jsx("button", { onClick: () => handleDelete(u), className: "text-[10px] text-destructive px-1.5 py-0.5 rounded hover:bg-destructive/10 cursor-pointer", children: "\u5220\u9664" })] })] }, u.id))) }), generatedPwd && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50", onClick: () => setGeneratedPwd(null), children: _jsxs("div", { className: "bg-background border rounded-xl p-5 max-w-sm mx-4 space-y-3", onClick: (e) => e.stopPropagation(), children: [_jsxs("p", { className: "text-sm font-medium", children: ["\u5BC6\u7801\u5DF2\u91CD\u7F6E \u2014 ", generatedPwd.username] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "\u8BF7\u5C06\u65B0\u5BC6\u7801\u53D1\u9001\u7ED9\u7528\u6237\uFF0C\u6B64\u5BC6\u7801\u4EC5\u663E\u793A\u4E00\u6B21\u3002" }), _jsxs("div", { className: "flex items-center gap-2 p-2 rounded border bg-card", children: [_jsx("code", { className: "flex-1 text-sm font-mono select-all", children: generatedPwd.password }), _jsx("button", { onClick: () => { navigator.clipboard.writeText(generatedPwd.password); }, className: "text-xs text-primary hover:underline cursor-pointer shrink-0", children: "\u590D\u5236" })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { size: "sm", onClick: () => setGeneratedPwd(null), children: "\u786E\u8BA4" }) })] }) }))] }));
}
// ==================== System ====================
function SystemTab() {
    const [info, setInfo] = useState(null);
    useEffect(() => { api.info().then(setInfo).catch(() => { }); }, []);
    if (!info)
        return null;
    return (_jsx("div", { className: "space-y-1.5", children: [
            { label: "AI 服务", enabled: info.ai },
            { label: "对象存储 (MinIO)", enabled: info.storage },
        ].map((item) => (_jsxs("div", { className: "flex items-center justify-between text-sm p-3 rounded-lg border bg-card", children: [_jsx("span", { children: item.label }), _jsx("span", { className: `text-xs px-2 py-0.5 rounded ${item.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`, children: item.enabled ? "已启用" : "未配置" })] }, item.label))) }));
}
// ==================== AI ====================
function AITab() {
    const [config, setConfig] = useState(null);
    const [baseUrl, setBaseUrl] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [model, setModel] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("");
    const [maxHistory, setMaxHistory] = useState(20);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    async function load() {
        try {
            const d = await api.getAIConfig();
            setConfig(d);
            setBaseUrl(d.base_url || "");
            setModel(d.model || "");
            setSystemPrompt(d.system_prompt || "");
            setMaxHistory(parseInt(d.max_history) || 20);
            setApiKey("");
        }
        catch { }
    }
    useEffect(() => { load(); }, []);
    if (!config)
        return null;
    const configured = config.enabled === "true";
    async function handleSave() {
        setSaving(true);
        setError("");
        try {
            let url = baseUrl.replace(/\/+$/, "");
            if (url && !url.endsWith("/v1"))
                url += "/v1";
            setBaseUrl(url);
            await api.setAIConfig({ base_url: url, api_key: apiKey || undefined, model: model || undefined, system_prompt: systemPrompt, max_history: String(maxHistory || 20) });
            load();
        }
        catch (err) {
            setError(err.message);
        }
        setSaving(false);
    }
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "\u914D\u7F6E\u540E\u6E20\u9053\u53EF\u9009\u62E9\u300C\u5185\u7F6E\u300D\u6A21\u5F0F\uFF0C\u65E0\u9700\u5355\u72EC\u586B\u5199 API Key" }), configured && _jsx(Button, { variant: "ghost", size: "sm", onClick: async () => { if (confirm("删除全局 AI 配置？")) {
                            await api.deleteAIConfig();
                            load();
                        } }, children: _jsx(Trash2, { className: "w-3.5 h-3.5 text-destructive" }) })] }), _jsx(Input, { placeholder: "https://api.openai.com/v1", value: baseUrl, onChange: (e) => setBaseUrl(e.target.value), className: "h-8 text-xs font-mono" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { type: "password", placeholder: configured ? `已配置 (${config.api_key})，留空不变` : "API Key", value: apiKey, onChange: (e) => setApiKey(e.target.value), className: "h-8 text-xs font-mono" }), _jsx(Input, { placeholder: "\u6A21\u578B\u540D\u79F0", value: model, onChange: (e) => setModel(e.target.value), className: "h-8 text-xs font-mono w-40" })] }), _jsx("textarea", { placeholder: "\u9ED8\u8BA4 System Prompt", value: systemPrompt, onChange: (e) => setSystemPrompt(e.target.value), rows: 3, className: "w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring resize-none" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-[10px] text-muted-foreground", children: "\u4E0A\u4E0B\u6587\u6D88\u606F\u6570" }), _jsx(Input, { type: "number", value: maxHistory, onChange: (e) => setMaxHistory(parseInt(e.target.value) || 20), className: "h-8 text-xs w-20", min: 1, max: 100 })] }), error && _jsx("p", { className: "text-[10px] text-destructive", children: error }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { size: "sm", onClick: handleSave, disabled: saving, children: "\u4FDD\u5B58" }) })] }));
}
// ==================== OAuth ====================
function OAuthTab() {
    const [config, setConfig] = useState(null);
    const [error, setError] = useState("");
    async function loadConfig() { try {
        setConfig(await api.getOAuthConfig());
    }
    catch { } }
    useEffect(() => { loadConfig(); }, []);
    if (!config)
        return null;
    const callbackBase = window.location.origin + "/api/auth/oauth/";
    return (_jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "DB \u914D\u7F6E\u4F18\u5148\u4E8E\u73AF\u5883\u53D8\u91CF\uFF0C\u65E0\u9700\u91CD\u542F\u670D\u52A1\u3002" }), error && _jsx("p", { className: "text-xs text-destructive", children: error }), Object.keys(providerLabels).map((name) => (_jsx(OAuthProviderForm, { name: name, label: providerLabels[name], config: config[name], callbackURL: callbackBase + name + "/callback", help: providerCallbackHelp[name], onSaved: loadConfig, onError: setError }, name)))] }));
}
function OAuthProviderForm({ name, label, config, callbackURL, help, onSaved, onError }) {
    const [clientId, setClientId] = useState(config?.client_id || "");
    const [clientSecret, setClientSecret] = useState("");
    const [saving, setSaving] = useState(false);
    useEffect(() => { setClientId(config?.client_id || ""); setClientSecret(""); }, [config]);
    async function handleSave() {
        if (!clientId.trim()) {
            onError("Client ID 不能为空");
            return;
        }
        setSaving(true);
        onError("");
        try {
            await api.setOAuthConfig(name, { client_id: clientId.trim(), client_secret: clientSecret });
            onSaved();
        }
        catch (err) {
            onError(err.message);
        }
        setSaving(false);
    }
    const source = config?.source;
    const enabled = config?.enabled;
    return (_jsxs("div", { className: "space-y-2 p-3 rounded-lg border bg-card", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium", children: label }), enabled && _jsx("span", { className: `ml-2 text-[10px] px-1.5 py-0.5 rounded ${source === "db" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`, children: source === "db" ? "数据库" : "环境变量" })] }), source === "db" && (_jsx(Button, { variant: "ghost", size: "sm", onClick: async () => { if (confirm(`删除 ${label} OAuth？`)) {
                            onError("");
                            try {
                                await api.deleteOAuthConfig(name);
                                onSaved();
                            }
                            catch (e) {
                                onError(e.message);
                            }
                        } }, children: _jsx(Trash2, { className: "w-3.5 h-3.5 text-destructive" }) }))] }), _jsx(Input, { placeholder: "Client ID", value: clientId, onChange: (e) => setClientId(e.target.value), className: "h-8 text-xs font-mono" }), _jsx(Input, { type: "password", placeholder: enabled ? "Client Secret（留空不变）" : "Client Secret", value: clientSecret, onChange: (e) => setClientSecret(e.target.value), className: "h-8 text-xs font-mono" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-[10px] text-muted-foreground space-y-0.5", children: [_jsxs("p", { children: ["\u56DE\u8C03\uFF1A", _jsx("code", { className: "select-all", children: callbackURL })] }), _jsx("p", { children: help })] }), _jsxs(Button, { size: "sm", onClick: handleSave, disabled: saving, children: [_jsx(Save, { className: "w-3.5 h-3.5 mr-1" }), " \u4FDD\u5B58"] })] })] }));
}
// ==================== Plugin Review ====================
function PluginReviewTab() {
    const [plugins, setPlugins] = useState([]);
    const [selected, setSelected] = useState(null);
    const [detail, setDetail] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [showReject, setShowReject] = useState(false);
    const [filter, setFilter] = useState("pending");
    async function load() {
        try {
            setPlugins(await api.listPlugins(filter) || []);
        }
        catch { }
    }
    useEffect(() => { load(); }, [filter]);
    async function openDetail(plugin) {
        setSelected(plugin);
        setShowReject(false);
        setRejectReason("");
        try {
            setDetail(await api.getPlugin(plugin.id));
        }
        catch {
            setDetail(plugin);
        }
    }
    async function handleApprove() {
        if (!selected)
            return;
        await api.reviewPlugin(selected.id, "approved");
        setSelected(null);
        setDetail(null);
        load();
    }
    async function handleReject() {
        if (!selected || !rejectReason.trim())
            return;
        await api.reviewPlugin(selected.id, "rejected", rejectReason.trim());
        setSelected(null);
        setDetail(null);
        load();
    }
    async function handleDelete(id) {
        if (!confirm("永久删除？"))
            return;
        await api.deletePlugin(id);
        if (selected?.id === id) {
            setSelected(null);
            setDetail(null);
        }
        load();
    }
    // Security analysis for detail modal
    function analyzeRisks(plugin) {
        const grants = (plugin.grant_perms || "").split(",").filter(Boolean);
        const connect = plugin.connect_domains || "*";
        const match = plugin.match_types || "*";
        const script = plugin.script || "";
        const risks = [];
        if (grants.includes("none"))
            risks.push({ level: "ok", text: "@grant none — 无副作用" });
        else if (grants.length === 0)
            risks.push({ level: "warn", text: "未声明 @grant — 默认全部 API 可用" });
        if (grants.includes("reply"))
            risks.push({ level: "warn", text: "reply() — 可向用户发消息" });
        if (grants.includes("skip"))
            risks.push({ level: "ok", text: "skip() — 可跳过推送" });
        if (connect === "*")
            risks.push({ level: "danger", text: "@connect * — 可重定向到任意域名" });
        else
            risks.push({ level: "ok", text: `@connect ${connect}` });
        if (match === "*")
            risks.push({ level: "ok", text: "@match * — 全部消息类型" });
        else
            risks.push({ level: "ok", text: `@match ${match}` });
        if (script.includes("while(true)") || script.includes("for(;;)"))
            risks.push({ level: "danger", text: "疑似死循环" });
        if (script.includes("__proto__") || script.includes("prototype"))
            risks.push({ level: "warn", text: "原型链操作" });
        return risks;
    }
    const riskColors = { ok: "text-primary", warn: "text-yellow-500", danger: "text-destructive" };
    const riskIcons = { ok: "✓", warn: "⚠", danger: "✕" };
    return (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "flex gap-1", children: ["pending", "approved", "rejected"].map((f) => (_jsx("button", { onClick: () => setFilter(f), className: `px-2 py-0.5 text-[10px] rounded cursor-pointer ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary"}`, children: f === "pending" ? "待审核" : f === "approved" ? "已通过" : "已拒绝" }, f))) }), plugins.length === 0 && (_jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: filter === "pending" ? "没有待审核的插件" : "暂无插件" })), _jsx("div", { className: "space-y-1", children: plugins.map((p) => (_jsxs("div", { className: "flex items-center justify-between p-2.5 rounded-lg border bg-card cursor-pointer hover:border-primary/50", onClick: () => openDetail(p), children: [_jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [p.icon && _jsx("span", { className: "text-base", children: p.icon }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-xs font-medium", children: p.name }), _jsxs("span", { className: "text-[10px] text-muted-foreground", children: ["v", p.version] }), p.submitter_name && _jsxs("span", { className: "text-[10px] text-muted-foreground", children: ["by ", p.submitter_name] })] }), _jsx("p", { className: "text-[10px] text-muted-foreground truncate", children: p.description })] })] }), _jsxs("div", { className: "flex items-center gap-1.5 shrink-0", children: [_jsxs("span", { className: "text-[10px] text-muted-foreground", children: [p.install_count, " \u5B89\u88C5"] }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-6", onClick: (e) => { e.stopPropagation(); handleDelete(p.id); }, children: _jsx(Trash2, { className: "w-3 h-3 text-destructive" }) })] })] }, p.id))) }), selected && detail && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50", onClick: () => { setSelected(null); setDetail(null); }, children: _jsxs("div", { className: "bg-background border rounded-xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "p-4 border-b flex items-start justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [detail.icon && _jsx("span", { className: "text-lg", children: detail.icon }), _jsx("span", { className: "font-semibold", children: detail.name }), _jsxs(Badge, { variant: "outline", className: "text-[10px]", children: ["v", detail.version] }), detail.license && _jsx("span", { className: "text-[10px] text-muted-foreground", children: detail.license })] }), _jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: detail.description }), _jsxs("div", { className: "flex items-center gap-3 mt-1 text-[10px] text-muted-foreground", children: [_jsxs("span", { children: ["by ", detail.author || "anonymous"] }), _jsxs("span", { children: ["\u62E5\u6709\u8005: ", detail.submitter_name] }), _jsx("span", { children: new Date(detail.created_at * 1000).toLocaleDateString() }), detail.namespace && _jsx("span", { className: "font-mono", children: detail.namespace }), detail.github_url && (_jsxs("a", { href: detail.github_url, target: "_blank", rel: "noopener", className: "text-primary hover:underline flex items-center gap-0.5", children: [_jsx(Github, { className: "w-3 h-3" }), " GitHub"] })), detail.commit_hash && _jsx("span", { className: "font-mono", children: detail.commit_hash.slice(0, 7) })] })] }), _jsx("button", { onClick: () => { setSelected(null); setDetail(null); }, className: "text-muted-foreground hover:text-foreground cursor-pointer", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "p-4 border-b space-y-1.5", children: [_jsxs("p", { className: "text-xs font-medium flex items-center gap-1", children: [_jsx(Shield, { className: "w-3.5 h-3.5" }), " \u5B89\u5168\u5206\u6790"] }), analyzeRisks(detail).map((r, i) => (_jsxs("div", { className: `text-[11px] flex items-start gap-1.5 ${riskColors[r.level]}`, children: [_jsx("span", { className: "shrink-0", children: riskIcons[r.level] }), _jsx("span", { children: r.text })] }, i)))] }), (detail.config_schema || []).length > 0 && (_jsxs("div", { className: "p-4 border-b", children: [_jsx("p", { className: "text-xs font-medium mb-1", children: "\u914D\u7F6E\u53C2\u6570" }), (detail.config_schema || []).map((c, i) => (_jsxs("div", { className: "text-[11px] flex items-center gap-2", children: [_jsx("code", { className: "font-mono bg-secondary px-1 rounded", children: c.name }), _jsx("span", { className: "text-muted-foreground", children: c.type }), c.description && _jsxs("span", { className: "text-muted-foreground", children: ["\u2014 ", c.description] })] }, i)))] })), _jsxs("div", { className: "border-b", children: [_jsxs("div", { className: "px-4 py-2 flex items-center justify-between", children: [_jsx("p", { className: "text-xs font-medium", children: "\u6E90\u7801" }), _jsxs("span", { className: "text-[10px] text-muted-foreground", children: [(detail.script || "").split("\n").length, " \u884C"] })] }), _jsx("pre", { className: "px-4 pb-4 text-[10px] font-mono overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap", children: detail.script || "加载中..." })] }), detail.reject_reason && (_jsxs("div", { className: "p-4 border-b", children: [_jsxs("p", { className: "text-xs text-destructive", children: ["\u62D2\u7EDD\u539F\u56E0\uFF1A", detail.reject_reason] }), detail.reviewer_name && _jsxs("p", { className: "text-[10px] text-muted-foreground", children: ["\u5BA1\u6838\u4EBA\uFF1A", detail.reviewer_name] })] })), detail.status === "pending" && (_jsx("div", { className: "p-4", children: !showReject ? (_jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", onClick: handleApprove, className: "flex-1", children: [_jsx(Check, { className: "w-3.5 h-3.5 mr-1" }), " \u901A\u8FC7"] }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => setShowReject(true), className: "flex-1", children: [_jsx(X, { className: "w-3.5 h-3.5 mr-1" }), " \u62D2\u7EDD"] })] })) : (_jsxs("div", { className: "space-y-2", children: [_jsx(Input, { value: rejectReason, onChange: (e) => setRejectReason(e.target.value), placeholder: "\u8BF7\u8F93\u5165\u62D2\u7EDD\u539F\u56E0...", className: "h-8 text-xs", autoFocus: true }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", variant: "destructive", onClick: handleReject, disabled: !rejectReason.trim(), className: "flex-1", children: "\u786E\u8BA4\u62D2\u7EDD" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => { setShowReject(false); setRejectReason(""); }, children: "\u53D6\u6D88" })] })] })) }))] }) }))] }));
}
