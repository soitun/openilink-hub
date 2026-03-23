import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../lib/api";
import { Github, Download, Check, X, Trash2, Send, ArrowLeft, ExternalLink, BookOpen, Bot, Puzzle, Shield } from "lucide-react";
const statusMap = {
    approved: { label: "已通过", variant: "default" },
    pending: { label: "待审核", variant: "outline" },
    rejected: { label: "已拒绝", variant: "destructive" },
};
export function PluginsPage({ embedded }) {
    const [plugins, setPlugins] = useState([]);
    const [tab, setTab] = useState("marketplace");
    const [user, setUser] = useState(null);
    async function load() {
        try {
            setUser(await api.me());
        }
        catch { }
        try {
            setPlugins(await api.listPlugins(tab === "review" ? "pending" : "approved") || []);
        }
        catch {
            setPlugins([]);
        }
    }
    useEffect(() => { load(); }, [tab]);
    const isLoggedIn = !!user;
    const isAdmin = user?.role === "admin";
    const content = (_jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "rounded-xl border bg-card p-5 space-y-3", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-base font-semibold", children: "\u793E\u533A\u9A71\u52A8\u7684 Webhook \u63D2\u4EF6" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "\u4E00\u952E\u5B89\u88C5\u5230\u4F60\u7684\u6E20\u9053\uFF0C\u81EA\u52A8\u8F6C\u53D1\u6D88\u606F\u5230\u98DE\u4E66\u3001Slack\u3001\u9489\u9489\u7B49\u670D\u52A1\u3002\u6240\u6709\u63D2\u4EF6\u4EE3\u7801\u516C\u5F00\u5BA1\u6838\uFF0C\u5728\u5B89\u5168\u6C99\u7BB1\u4E2D\u6267\u884C\u3002" })] }), _jsx("div", { className: "flex gap-2 shrink-0", children: isLoggedIn && (_jsxs(Button, { variant: "outline", size: "sm", className: "text-xs", onClick: () => setTab("submit"), children: [_jsx(Send, { className: "w-3 h-3 mr-1" }), " \u63D0\u4EA4\u63D2\u4EF6"] })) })] }), _jsxs("div", { className: "flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20", children: [_jsx(Bot, { className: "w-5 h-5 text-primary shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium", children: "\u4F7F\u7528 AI \u7F16\u5199\u63D2\u4EF6" }), _jsx("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: "\u5C06\u4EE5\u4E0B\u94FE\u63A5\u53D1\u9001\u7ED9\u4F60\u7684 AI \u52A9\u624B\uFF08Claude\u3001ChatGPT \u7B49\uFF09\uFF0C\u5B83\u53EF\u4EE5\u76F4\u63A5\u9605\u8BFB\u5E76\u4E3A\u4F60\u751F\u6210\u7B26\u5408\u89C4\u8303\u7684\u63D2\u4EF6\u4EE3\u7801\uFF1A" }), _jsxs("div", { className: "flex items-center gap-2 mt-1.5", children: [_jsxs("code", { className: "text-[10px] font-mono bg-background border rounded px-2 py-1 select-all", children: [location.origin, "/api/webhook-plugins/skill.md"] }), _jsx(CopyButton, { value: `${location.origin}/api/webhook-plugins/skill.md` }), _jsxs("a", { href: "/api/webhook-plugins/skill.md", target: "_blank", rel: "noopener", className: "text-[10px] text-primary hover:underline flex items-center gap-0.5", children: [_jsx(BookOpen, { className: "w-3 h-3" }), " \u9884\u89C8\u6587\u6863"] })] })] })] })] }), _jsxs("div", { className: "flex border rounded-lg overflow-hidden w-fit", children: [_jsxs("button", { className: `px-3 py-1 text-xs cursor-pointer ${tab === "marketplace" ? "bg-secondary" : "text-muted-foreground"}`, onClick: () => setTab("marketplace"), children: ["\u5E02\u573A ", plugins.length > 0 && tab === "marketplace" ? `(${plugins.length})` : ""] }), isLoggedIn && (_jsx("button", { className: `px-3 py-1 text-xs cursor-pointer ${tab === "submit" ? "bg-secondary" : "text-muted-foreground"}`, onClick: () => setTab("submit"), children: "\u63D0\u4EA4" })), isAdmin && (_jsxs("button", { className: `px-3 py-1 text-xs cursor-pointer ${tab === "review" ? "bg-secondary" : "text-muted-foreground"}`, onClick: () => setTab("review"), children: ["\u5BA1\u6838 ", plugins.length > 0 && tab === "review" ? `(${plugins.length})` : ""] }))] }), tab === "marketplace" && (_jsxs("div", { className: "space-y-3", children: [plugins.length === 0 && (_jsxs("div", { className: "text-center py-16 space-y-3", children: [_jsx(Puzzle, { className: "w-10 h-10 mx-auto text-muted-foreground/50" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "\u6682\u65E0\u5DF2\u5BA1\u6838\u7684\u63D2\u4EF6" }), isLoggedIn && (_jsx(Button, { variant: "outline", size: "sm", className: "text-xs", onClick: () => setTab("submit"), children: "\u6210\u4E3A\u7B2C\u4E00\u4E2A\u8D21\u732E\u8005" }))] })), plugins.map((p) => _jsx(PluginCard, { plugin: p, onRefresh: load, isAdmin: isAdmin, isLoggedIn: isLoggedIn, mode: "marketplace" }, p.id))] })), tab === "submit" && _jsx(SubmitForm, { onSubmitted: () => { setTab("marketplace"); load(); } }), tab === "review" && (_jsxs("div", { className: "space-y-4", children: [plugins.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx(Shield, { className: "w-8 h-8 mx-auto text-muted-foreground/50 mb-2" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "\u6CA1\u6709\u5F85\u5BA1\u6838\u7684\u63D2\u4EF6" })] })), plugins.map((p) => _jsx(ReviewCard, { plugin: p, onRefresh: load }, p.id))] }))] }));
    if (embedded)
        return content;
    return (_jsxs("div", { className: "min-h-screen flex flex-col", children: [_jsxs("header", { className: "border-b px-6 py-3 flex items-center justify-between shrink-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Link, { to: "/", className: "text-muted-foreground hover:text-foreground", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsx(Puzzle, { className: "w-4 h-4 text-primary" }), _jsx("span", { className: "font-semibold text-sm", children: "Webhook \u63D2\u4EF6\u5E02\u573A" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [!isLoggedIn && _jsx(Link, { to: "/login", children: _jsx(Button, { size: "sm", className: "text-xs", children: "\u767B\u5F55" }) }), isLoggedIn && _jsx("span", { className: "text-xs text-muted-foreground", children: user.username })] })] }), _jsx("main", { className: "flex-1 p-6 max-w-4xl mx-auto w-full", children: content }), _jsxs("footer", { className: "border-t py-3 text-center text-[10px] text-muted-foreground", children: [_jsx("a", { href: "https://github.com/openilink/openilink-hub", target: "_blank", rel: "noopener", className: "hover:text-primary", children: "OpenILink Hub" }), " · ", "Webhook \u63D2\u4EF6\u8FD0\u884C\u5728\u5B89\u5168\u6C99\u7BB1\u4E2D\uFF085s \u8D85\u65F6 \u00B7 \u7981\u6B62\u7CFB\u7EDF\u8BBF\u95EE \u00B7 \u7BA1\u7406\u5458\u5BA1\u6838\uFF09"] })] }));
}
function CopyButton({ value }) {
    const [copied, setCopied] = useState(false);
    return (_jsx("button", { onClick: () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }, className: "cursor-pointer text-muted-foreground hover:text-foreground", children: copied ? _jsx(Check, { className: "w-3 h-3 text-primary" }) : _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }), _jsx("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })] }) }));
}
function PluginCard({ plugin, onRefresh, isAdmin, isLoggedIn, mode }) {
    const [detail, setDetail] = useState(null);
    const [showScript, setShowScript] = useState(false);
    const [versions, setVersions] = useState(null);
    const [showVersions, setShowVersions] = useState(false);
    async function toggleVersions() {
        if (!showVersions && !versions) {
            try {
                setVersions(await api.pluginVersions(plugin.id) || []);
            }
            catch {
                setVersions([]);
            }
        }
        setShowVersions(!showVersions);
    }
    async function handleInstall() {
        const data = await api.installPlugin(plugin.id);
        await navigator.clipboard.writeText(data.script);
        alert("脚本已复制到剪贴板！\n\n推荐方式：进入渠道 → Webhook → 插件市场 → 选择此插件一键安装");
        onRefresh();
    }
    async function handleReview(status) {
        let reason = "";
        if (status === "rejected") {
            reason = prompt("请输入拒绝原因：") || "";
            if (!reason)
                return;
        }
        await api.reviewPlugin(plugin.id, status, reason);
        onRefresh();
    }
    async function handleDelete() {
        if (!confirm("确认删除此插件？"))
            return;
        await api.deletePlugin(plugin.id);
        onRefresh();
    }
    async function toggleScript() {
        if (!detail) {
            try {
                setDetail(await api.getPlugin(plugin.id));
            }
            catch { }
        }
        setShowScript(!showScript);
    }
    const s = statusMap[plugin.status] || statusMap.pending;
    const config = plugin.config_schema || [];
    const grants = (plugin.grant_perms || "").split(",").filter(Boolean);
    const matchTypes = plugin.match_types || "*";
    const connectDomains = plugin.connect_domains || "*";
    const riskLevel = connectDomains === "*" && grants.includes("reply") ? "high"
        : connectDomains === "*" || grants.includes("reply") ? "medium" : "low";
    const riskColors = { low: "text-primary", medium: "text-yellow-500", high: "text-destructive" };
    const riskLabels = { low: "低风险", medium: "中风险", high: "高风险" };
    return (_jsxs(Card, { className: "space-y-2", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [plugin.icon && _jsx("span", { className: "text-base", children: plugin.icon }), _jsx("span", { className: "font-medium text-sm", children: plugin.name }), _jsx(Badge, { variant: s.variant, className: "text-[10px]", children: s.label }), _jsxs("span", { className: "text-[10px] text-muted-foreground", children: ["v", plugin.version] }), plugin.license && _jsx("span", { className: "text-[10px] text-muted-foreground", children: plugin.license })] }), _jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: plugin.description }), _jsxs("div", { className: "flex items-center gap-3 mt-1 text-[10px] text-muted-foreground flex-wrap", children: [_jsxs("span", { children: ["\u4F5C\u8005: ", plugin.author || "anonymous"] }), plugin.submitter_name && _jsxs("span", { children: ["\u62E5\u6709\u8005: ", plugin.submitter_name] }), plugin.reviewer_name && _jsxs("span", { children: ["\u5BA1\u6838: ", plugin.reviewer_name] }), _jsxs("span", { children: [plugin.install_count, " \u6B21\u5B89\u88C5"] }), _jsx("span", { children: new Date(plugin.created_at * 1000).toLocaleDateString() }), (plugin.github_url || plugin.homepage) && (_jsxs("a", { href: plugin.homepage || plugin.github_url, target: "_blank", rel: "noopener", className: "flex items-center gap-0.5 hover:text-primary", children: [_jsx(Github, { className: "w-3 h-3" }), " \u6E90\u7801"] })), plugin.commit_hash && _jsx("span", { className: "font-mono", children: plugin.commit_hash.slice(0, 7) })] }), _jsxs("div", { className: "flex items-center gap-2 mt-1 text-[10px] flex-wrap", children: [_jsxs("span", { className: riskColors[riskLevel], children: [_jsx(Shield, { className: "w-3 h-3 inline mr-0.5" }), riskLabels[riskLevel]] }), _jsxs("span", { className: "text-muted-foreground", children: ["\u6743\u9650: ", grants.length > 0 ? grants.join(", ") : "none"] }), _jsxs("span", { className: "text-muted-foreground", children: ["\u6D88\u606F: ", matchTypes] }), connectDomains !== "*" && _jsxs("span", { className: "text-muted-foreground", children: ["\u57DF\u540D: ", connectDomains] })] }), plugin.reject_reason && _jsxs("p", { className: "text-[10px] text-destructive mt-0.5", children: ["\u62D2\u7EDD\u539F\u56E0\uFF1A", plugin.reject_reason] })] }), _jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [_jsx(Button, { size: "sm", variant: "ghost", className: "h-7 text-xs", onClick: toggleVersions, children: showVersions ? "收起" : "版本" }), _jsx(Button, { size: "sm", variant: "ghost", className: "h-7 text-xs", onClick: toggleScript, children: showScript ? "收起" : "源码" }), mode === "marketplace" && plugin.status === "approved" && isLoggedIn && (_jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs", onClick: handleInstall, children: [_jsx(Download, { className: "w-3 h-3 mr-1" }), " \u5B89\u88C5"] })), mode === "review" && (_jsxs(_Fragment, { children: [_jsxs(Button, { size: "sm", className: "h-7 text-xs", onClick: () => handleReview("approved"), children: [_jsx(Check, { className: "w-3 h-3 mr-1" }), " \u901A\u8FC7"] }), _jsxs(Button, { size: "sm", variant: "destructive", className: "h-7 text-xs", onClick: () => handleReview("rejected"), children: [_jsx(X, { className: "w-3 h-3 mr-1" }), " \u62D2\u7EDD"] })] })), isAdmin && (_jsx(Button, { size: "sm", variant: "ghost", className: "h-7", onClick: handleDelete, children: _jsx(Trash2, { className: "w-3 h-3 text-destructive" }) }))] })] }), config.length > 0 && (_jsxs("div", { className: "text-[10px] text-muted-foreground", children: ["\u914D\u7F6E\u9879\uFF1A", config.map((c) => `${c.name} (${c.description || c.type})`).join("、")] })), showVersions && versions && (_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-[10px] font-medium", children: "\u53D1\u7248\u5386\u53F2" }), versions.map((v) => (_jsxs("div", { className: "flex items-center gap-2 text-[10px] p-1.5 rounded border bg-background", children: [_jsxs("span", { className: `font-mono font-medium ${v.id === plugin.id ? "text-primary" : ""}`, children: ["v", v.version] }), _jsx(Badge, { variant: v.status === "approved" ? "default" : v.status === "rejected" ? "destructive" : "outline", className: "text-[10px]", children: v.status === "approved" ? "✓" : v.status === "rejected" ? "✕" : "⏳" }), v.changelog && _jsx("span", { className: "text-muted-foreground flex-1 truncate", children: v.changelog }), v.commit_hash && _jsx("span", { className: "font-mono text-muted-foreground", children: v.commit_hash.slice(0, 7) }), _jsx("span", { className: "text-muted-foreground", children: new Date(v.created_at * 1000).toLocaleDateString() })] }, v.id))), versions.length === 0 && _jsx("p", { className: "text-[10px] text-muted-foreground", children: "\u6682\u65E0\u5386\u53F2\u7248\u672C" })] })), showScript && (_jsx("div", { children: detail?.script ? (_jsx("pre", { className: "text-[10px] bg-background border rounded p-3 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap font-mono", children: detail.script })) : plugin.github_url ? (_jsxs("a", { href: plugin.github_url, target: "_blank", rel: "noopener", className: "text-xs text-primary flex items-center gap-1", children: [_jsx(ExternalLink, { className: "w-3 h-3" }), " \u5728 GitHub \u67E5\u770B\u6E90\u7801"] })) : (_jsx("p", { className: "text-[10px] text-muted-foreground", children: "\u767B\u5F55\u540E\u53EF\u67E5\u770B\u811A\u672C\u6E90\u7801" })) }))] }));
}
function ReviewCard({ plugin, onRefresh }) {
    const [detail, setDetail] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [showReject, setShowReject] = useState(false);
    useEffect(() => {
        api.getPlugin(plugin.id).then(setDetail).catch(() => { });
    }, [plugin.id]);
    async function handleApprove() {
        await api.reviewPlugin(plugin.id, "approved");
        onRefresh();
    }
    async function handleReject() {
        if (!rejectReason.trim())
            return;
        await api.reviewPlugin(plugin.id, "rejected", rejectReason.trim());
        onRefresh();
    }
    async function handleDelete() {
        if (!confirm("永久删除此插件？"))
            return;
        await api.deletePlugin(plugin.id);
        onRefresh();
    }
    const grants = (plugin.grant_perms || "").split(",").filter(Boolean);
    const matchTypes = plugin.match_types || "*";
    const connectDomains = plugin.connect_domains || "*";
    const hasReply = grants.includes("reply");
    const hasSkip = grants.includes("skip");
    const isGrantNone = grants.includes("none");
    const wildcardConnect = connectDomains === "*";
    const wildcardMatch = matchTypes === "*";
    const risks = [];
    if (isGrantNone)
        risks.push({ level: "ok", text: "声明 @grant none — 无副作用" });
    else if (grants.length === 0)
        risks.push({ level: "warn", text: "未声明 @grant — 默认全部 API 可用" });
    if (hasReply)
        risks.push({ level: "warn", text: "使用 reply() — 可向用户发送消息" });
    if (hasSkip)
        risks.push({ level: "ok", text: "使用 skip() — 可跳过 webhook 推送" });
    if (wildcardConnect)
        risks.push({ level: "danger", text: "@connect * — 可将请求重定向到任意域名" });
    else if (connectDomains)
        risks.push({ level: "ok", text: `@connect 限定域名: ${connectDomains}` });
    if (wildcardMatch)
        risks.push({ level: "ok", text: "@match * — 所有消息类型触发" });
    else
        risks.push({ level: "ok", text: `@match 限定类型: ${matchTypes}` });
    // Check script for suspicious patterns
    const scriptText = detail?.script || "";
    if (scriptText.includes("while(true)") || scriptText.includes("for(;;)"))
        risks.push({ level: "danger", text: "检测到疑似死循环" });
    if (scriptText.includes("__proto__") || scriptText.includes("prototype"))
        risks.push({ level: "warn", text: "检测到原型链操作" });
    if ((scriptText.match(/reply\(/g) || []).length > 3)
        risks.push({ level: "warn", text: `多处 reply() 调用 (${(scriptText.match(/reply\(/g) || []).length} 处)` });
    const riskColors = { ok: "text-primary", warn: "text-yellow-500", danger: "text-destructive" };
    const riskIcons = { ok: "✓", warn: "⚠", danger: "✕" };
    const overallRisk = risks.some(r => r.level === "danger") ? "danger" : risks.some(r => r.level === "warn") ? "warn" : "ok";
    const overallLabels = { ok: "低风险", warn: "需注意", danger: "高风险" };
    const overallColors = { ok: "border-primary/30 bg-primary/5", warn: "border-yellow-500/30 bg-yellow-500/5", danger: "border-destructive/30 bg-destructive/5" };
    return (_jsxs("div", { className: `rounded-xl border-2 ${overallColors[overallRisk]} p-4 space-y-3`, children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [plugin.icon && _jsx("span", { className: "text-lg", children: plugin.icon }), _jsx("span", { className: "font-semibold text-sm", children: plugin.name }), _jsxs("span", { className: "text-[10px] text-muted-foreground", children: ["v", plugin.version] }), plugin.namespace && _jsx("span", { className: "text-[10px] font-mono text-muted-foreground", children: plugin.namespace })] }), _jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: plugin.description }), _jsxs("div", { className: "flex items-center gap-3 mt-1 text-[10px] text-muted-foreground flex-wrap", children: [_jsxs("span", { children: ["\u4F5C\u8005: ", plugin.author || "anonymous"] }), _jsxs("span", { children: ["\u62E5\u6709\u8005: ", plugin.submitter_name] }), plugin.license && _jsx("span", { children: plugin.license }), plugin.github_url && (_jsxs("a", { href: plugin.github_url, target: "_blank", rel: "noopener", className: "text-primary hover:underline flex items-center gap-0.5", children: [_jsx(Github, { className: "w-3 h-3" }), " GitHub"] })), plugin.commit_hash && _jsx("span", { className: "font-mono", children: plugin.commit_hash.slice(0, 7) })] })] }), _jsxs("div", { className: `px-2 py-1 rounded text-xs font-medium ${riskColors[overallRisk]}`, children: [_jsx(Shield, { className: "w-3.5 h-3.5 inline mr-0.5" }), overallLabels[overallRisk]] })] }), _jsxs("div", { className: "rounded-lg border bg-card p-3 space-y-1.5", children: [_jsxs("p", { className: "text-xs font-medium flex items-center gap-1", children: [_jsx(Shield, { className: "w-3.5 h-3.5" }), " \u5B89\u5168\u5206\u6790"] }), risks.map((r, i) => (_jsxs("div", { className: `text-[11px] flex items-start gap-1.5 ${riskColors[r.level]}`, children: [_jsx("span", { className: "shrink-0", children: riskIcons[r.level] }), _jsx("span", { children: r.text })] }, i)))] }), (plugin.config_schema || []).length > 0 && (_jsxs("div", { className: "rounded-lg border bg-card p-3", children: [_jsx("p", { className: "text-xs font-medium mb-1", children: "\u914D\u7F6E\u53C2\u6570" }), _jsx("div", { className: "space-y-1", children: (plugin.config_schema || []).map((c, i) => (_jsxs("div", { className: "text-[11px] flex items-center gap-2", children: [_jsx("code", { className: "font-mono bg-background px-1 rounded", children: c.name }), _jsx("span", { className: "text-muted-foreground", children: c.type }), c.description && _jsxs("span", { className: "text-muted-foreground", children: ["\u2014 ", c.description] })] }, i))) })] })), _jsxs("div", { className: "rounded-lg border bg-card", children: [_jsxs("div", { className: "px-3 py-2 border-b flex items-center justify-between", children: [_jsx("p", { className: "text-xs font-medium", children: "\u6E90\u7801" }), _jsxs("span", { className: "text-[10px] text-muted-foreground", children: [scriptText.split("\n").length, " \u884C"] })] }), _jsx("pre", { className: "p-3 text-[10px] font-mono overflow-x-auto max-h-80 overflow-y-auto whitespace-pre-wrap", children: scriptText || "加载中..." })] }), _jsx("div", { className: "flex items-center gap-2 pt-1", children: !showReject ? (_jsxs(_Fragment, { children: [_jsxs(Button, { size: "sm", onClick: handleApprove, className: "flex-1", children: [_jsx(Check, { className: "w-3.5 h-3.5 mr-1" }), " \u901A\u8FC7\u5BA1\u6838"] }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => setShowReject(true), className: "flex-1", children: [_jsx(X, { className: "w-3.5 h-3.5 mr-1" }), " \u62D2\u7EDD"] }), _jsx(Button, { size: "sm", variant: "ghost", onClick: handleDelete, children: _jsx(Trash2, { className: "w-3.5 h-3.5 text-destructive" }) })] })) : (_jsxs("div", { className: "flex-1 space-y-2", children: [_jsx(Input, { value: rejectReason, onChange: (e) => setRejectReason(e.target.value), placeholder: "\u8BF7\u8F93\u5165\u62D2\u7EDD\u539F\u56E0...", className: "h-8 text-xs", autoFocus: true }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", variant: "destructive", onClick: handleReject, disabled: !rejectReason.trim(), className: "flex-1", children: "\u786E\u8BA4\u62D2\u7EDD" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => { setShowReject(false); setRejectReason(""); }, children: "\u53D6\u6D88" })] })] })) })] }));
}
function SubmitForm({ onSubmitted }) {
    const [mode, setMode] = useState("github");
    const [url, setUrl] = useState("");
    const [script, setScript] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    async function handleSubmit(e) {
        e.preventDefault();
        const data = mode === "github" ? { github_url: url.trim() } : { script: script.trim() };
        if (!data.github_url && !data.script)
            return;
        setSubmitting(true);
        setError("");
        try {
            await api.submitPlugin(data);
            setUrl("");
            setScript("");
            onSubmitted();
        }
        catch (err) {
            setError(err.message);
        }
        setSubmitting(false);
    }
    const canSubmit = mode === "github" ? !!url.trim() : !!script.trim();
    const templateScript = `// ==WebhookPlugin==
// @name         我的插件
// @namespace    github.com/yourname
// @version      1.0.0
// @description  插件功能描述
// @author       你的名字
// @license      MIT
// @icon         🔔
// @match        text
// @connect      *
// @grant        none
// ==/WebhookPlugin==

function onRequest(ctx) {
  ctx.req.body = JSON.stringify({
    text: ctx.msg.sender + ": " + ctx.msg.content
  });
}`;
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs(Card, { className: "flex items-start gap-3 bg-primary/5 border-primary/20", children: [_jsx(Bot, { className: "w-5 h-5 text-primary shrink-0 mt-0.5" }), _jsxs("div", { className: "text-xs", children: [_jsx("p", { className: "font-medium", children: "\u63A8\u8350\uFF1A\u8BA9 AI \u5E2E\u4F60\u5199\u63D2\u4EF6" }), _jsxs("p", { className: "text-muted-foreground mt-0.5", children: ["\u5C06 ", _jsx("a", { href: "/api/webhook-plugins/skill.md", target: "_blank", className: "text-primary hover:underline", children: "skill.md" }), " \u94FE\u63A5\u53D1\u7ED9 AI \u52A9\u624B\uFF0C\u63CF\u8FF0\u4F60\u7684\u9700\u6C42\uFF0CAI \u4F1A\u751F\u6210\u5B8C\u6574\u7684\u63D2\u4EF6\u4EE3\u7801\u3002\u751F\u6210\u540E\u7C98\u8D34\u5230\u4E0B\u65B9\u63D0\u4EA4\u5373\u53EF\u3002"] })] })] }), _jsxs(Card, { className: "space-y-3", children: [_jsx("h3", { className: "text-sm font-medium", children: "\u63D0\u4EA4 Webhook \u63D2\u4EF6" }), _jsxs("div", { className: "flex border rounded-lg overflow-hidden w-fit", children: [_jsx("button", { className: `px-3 py-1 text-xs cursor-pointer ${mode === "github" ? "bg-secondary" : "text-muted-foreground"}`, onClick: () => setMode("github"), children: "GitHub \u94FE\u63A5" }), _jsx("button", { className: `px-3 py-1 text-xs cursor-pointer ${mode === "paste" ? "bg-secondary" : "text-muted-foreground"}`, onClick: () => setMode("paste"), children: "\u7C98\u8D34\u811A\u672C" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-2", children: [mode === "github" ? (_jsxs(_Fragment, { children: [_jsx(Input, { value: url, onChange: (e) => setUrl(e.target.value), placeholder: "https://github.com/user/repo/blob/main/plugin.js", className: "h-8 text-xs font-mono" }), _jsx("p", { className: "text-[10px] text-muted-foreground", children: "\u81EA\u52A8\u62C9\u53D6\u811A\u672C\u5E76\u56FA\u5B9A commit hash\uFF0C\u786E\u4FDD\u5BA1\u6838\u7684\u4EE3\u7801\u5C31\u662F\u8FD0\u884C\u7684\u4EE3\u7801\u3002" })] })) : (_jsxs(_Fragment, { children: [_jsx("textarea", { value: script, onChange: (e) => setScript(e.target.value), placeholder: templateScript, rows: 16, className: "w-full rounded-md border border-input bg-transparent px-3 py-2 text-[11px] font-mono placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring resize-none" }), _jsxs("p", { className: "text-[10px] text-muted-foreground", children: ["\u4F7F\u7528 ", _jsx("code", { className: "bg-secondary px-1 rounded", children: "// ==WebhookPlugin==" }), " \u683C\u5F0F\u58F0\u660E\u5143\u6570\u636E\u3002", _jsx("a", { href: "/api/webhook-plugins/skill.md", target: "_blank", className: "text-primary hover:underline ml-1", children: "\u67E5\u770B\u5B8C\u6574\u89C4\u8303" })] })] })), _jsxs("div", { className: "flex items-center justify-between", children: [error && _jsx("span", { className: "text-xs text-destructive", children: error }), _jsxs(Button, { type: "submit", size: "sm", disabled: submitting || !canSubmit, className: "ml-auto", children: [_jsx(Send, { className: "w-3.5 h-3.5 mr-1" }), " ", submitting ? "提交中..." : "提交审核"] })] })] })] }), _jsxs(Card, { className: "space-y-2", children: [_jsx("h3", { className: "text-xs font-medium", children: "\u5FEB\u901F\u53C2\u8003" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]", children: [_jsxs("div", { className: "p-2 rounded border bg-background", children: [_jsx("p", { className: "font-medium mb-1", children: "ctx.msg\uFF08\u6D88\u606F\uFF09" }), _jsx("p", { className: "text-muted-foreground", children: ".sender .content .msg_type .channel_id .bot_id .timestamp .items[]" })] }), _jsxs("div", { className: "p-2 rounded border bg-background", children: [_jsx("p", { className: "font-medium mb-1", children: "ctx.req\uFF08\u8BF7\u6C42\uFF09" }), _jsx("p", { className: "text-muted-foreground", children: ".url .method .headers .body" })] }), _jsxs("div", { className: "p-2 rounded border bg-background", children: [_jsx("p", { className: "font-medium mb-1", children: "\u5168\u5C40\u51FD\u6570" }), _jsx("p", { className: "text-muted-foreground", children: "reply(text) skip() JSON.parse/stringify" })] })] }), _jsxs("div", { className: "flex items-center gap-3 text-[10px] text-muted-foreground", children: [_jsxs("span", { children: [_jsx(Shield, { className: "w-3 h-3 inline" }), " 5s \u8D85\u65F6"] }), _jsx("span", { children: "\u6808\u6DF1 64" }), _jsx("span", { children: "\u7981\u6B62 eval/require" }), _jsx("span", { children: "reply \u6700\u591A 10 \u6B21" }), _jsxs("a", { href: "/api/webhook-plugins/skill.md", target: "_blank", className: "text-primary hover:underline ml-auto flex items-center gap-0.5", children: [_jsx(BookOpen, { className: "w-3 h-3" }), " \u5B8C\u6574\u6587\u6863"] })] })] })] }));
}
