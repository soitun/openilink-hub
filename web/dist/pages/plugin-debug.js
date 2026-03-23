import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { api } from "../lib/api";
import { Play, ChevronDown } from "lucide-react";
const defaultScript = `// ==WebhookPlugin==
// @name         调试插件
// @version      1.0.0
// @match        text
// @connect      *
// @grant        reply
// ==/WebhookPlugin==

function onRequest(ctx) {
  ctx.req.body = JSON.stringify({
    text: ctx.msg.sender + ": " + ctx.msg.content
  });
}

function onResponse(ctx) {
  if (ctx.res.status === 200) {
    reply("收到响应: " + ctx.res.status);
  }
}`;
export function PluginDebugPage() {
    const [searchParams] = useSearchParams();
    const [script, setScript] = useState(defaultScript);
    const [webhookUrl, setWebhookUrl] = useState("https://httpbin.org/post");
    const [sender, setSender] = useState("test_user@debug");
    const [content, setContent] = useState("Hello from debug");
    const [msgType, setMsgType] = useState("text");
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [plugins, setPlugins] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    const [myPlugins, setMyPlugins] = useState([]);
    // Load plugin list for picker
    useEffect(() => {
        Promise.all([
            api.listPlugins().catch(() => []),
            api.myPlugins().catch(() => []),
        ]).then(([pub, mine]) => {
            setPlugins(pub || []);
            setMyPlugins(mine || []);
        });
    }, []);
    // Load plugin from URL param ?plugin=id
    useEffect(() => {
        const pluginId = searchParams.get("plugin");
        if (pluginId) {
            api.getPlugin(pluginId).then((p) => {
                if (p.script)
                    setScript(p.script);
            }).catch(() => { });
        }
    }, [searchParams]);
    async function handleRun() {
        setRunning(true);
        setResult(null);
        const mockMessage = { sender, content, msg_type: msgType };
        const allLogs = [];
        try {
            // Step 1: Execute onRequest on backend (sandbox)
            const step1 = await api.debugRequest({ script, webhook_url: webhookUrl, mock_message: mockMessage });
            allLogs.push(...(step1.logs || []));
            if (step1.error || step1.skipped) {
                setResult({ ...step1, logs: allLogs });
                setRunning(false);
                return;
            }
            // Step 2: Frontend sends HTTP request
            let httpResponse = null;
            if (step1.request) {
                allLogs.push(`→ 前端发送 ${step1.request.method} ${step1.request.url}`);
                try {
                    const res = await fetch(step1.request.url, {
                        method: step1.request.method,
                        headers: step1.request.headers,
                        body: step1.request.body,
                    });
                    const body = await res.text();
                    const headers = {};
                    res.headers.forEach((v, k) => { headers[k] = v; });
                    httpResponse = { status: res.status, headers, body };
                    allLogs.push(`✓ 响应 ${res.status} (${body.length} 字节)`);
                }
                catch (err) {
                    allLogs.push(`✕ HTTP 请求失败: ${err.message}`);
                }
            }
            // Step 3: Execute onResponse on backend (sandbox)
            let step3 = null;
            if (httpResponse) {
                step3 = await api.debugResponse({ script, mock_message: mockMessage, response: httpResponse });
                allLogs.push(...(step3.logs || []));
            }
            setResult({
                request: step1.request,
                response: httpResponse,
                replies: [...(step1.replies || []), ...(step3?.replies || [])],
                skipped: false,
                error: step3?.error || "",
                logs: allLogs,
                permissions: step1.permissions,
            });
        }
        catch (err) {
            allLogs.push(`✕ 错误: ${err.message}`);
            setResult({ error: err.message, logs: allLogs });
        }
        setRunning(false);
    }
    function loadPlugin(p) {
        api.getPlugin(p.id).then((detail) => {
            if (detail.script)
                setScript(detail.script);
            setShowPicker(false);
        }).catch(() => setShowPicker(false));
    }
    const allPlugins = [...myPlugins.filter((m) => !plugins.some((p) => p.id === m.id)), ...plugins];
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-lg font-semibold", children: "\u63D2\u4EF6\u8C03\u8BD5\u5668" }), _jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "\u5B8C\u6574\u6267\u884C\u63D2\u4EF6\u811A\u672C\uFF1A\u89E3\u6790 \u2192 onRequest \u2192 \u5B9E\u9645 HTTP \u8BF7\u6C42 \u2192 onResponse \u2192 reply" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-xs font-medium", children: "\u811A\u672C" }), _jsxs("div", { className: "relative", children: [_jsxs(Button, { variant: "outline", size: "sm", className: "text-[10px] h-6", onClick: () => setShowPicker(!showPicker), children: ["\u52A0\u8F7D\u5DF2\u6709\u63D2\u4EF6 ", _jsx(ChevronDown, { className: "w-3 h-3 ml-1" })] }), showPicker && (_jsxs("div", { className: "absolute right-0 top-7 z-10 w-64 border rounded-lg bg-background shadow-lg max-h-56 overflow-y-auto", children: [allPlugins.length === 0 && _jsx("p", { className: "text-[10px] text-muted-foreground p-3 text-center", children: "\u6682\u65E0\u63D2\u4EF6" }), allPlugins.map((p) => (_jsxs("button", { onClick: () => loadPlugin(p), className: "w-full text-left px-3 py-2 text-xs hover:bg-secondary cursor-pointer border-b last:border-0 flex items-center justify-between", children: [_jsxs("span", { children: [p.icon, " ", p.name, " ", _jsxs("span", { className: "text-muted-foreground", children: ["v", p.version] })] }), _jsx("span", { className: "text-[10px] text-muted-foreground", children: p.status })] }, p.id))), _jsx("button", { onClick: () => setShowPicker(false), className: "w-full text-center text-[10px] text-muted-foreground py-1.5 hover:text-primary cursor-pointer", children: "\u5173\u95ED" })] }))] })] }), _jsx("textarea", { value: script, onChange: (e) => setScript(e.target.value), rows: 24, className: "w-full rounded-md border border-input bg-transparent px-3 py-2 text-[11px] font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring resize-none" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs(Card, { className: "space-y-2 p-3", children: [_jsx("p", { className: "text-xs font-medium", children: "\u8BF7\u6C42\u914D\u7F6E" }), _jsxs("div", { children: [_jsx("label", { className: "text-[10px] text-muted-foreground", children: "Webhook URL" }), _jsx(Input, { value: webhookUrl, onChange: (e) => setWebhookUrl(e.target.value), className: "h-7 text-[11px] font-mono" })] }), _jsx("p", { className: "text-xs font-medium mt-2", children: "\u6A21\u62DF\u6D88\u606F" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("label", { className: "text-[10px] text-muted-foreground", children: "\u53D1\u9001\u8005" }), _jsx(Input, { value: sender, onChange: (e) => setSender(e.target.value), className: "h-7 text-[11px]" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-[10px] text-muted-foreground", children: "\u6D88\u606F\u7C7B\u578B" }), _jsx("select", { value: msgType, onChange: (e) => setMsgType(e.target.value), className: "w-full h-7 text-[11px] rounded-md border border-input bg-transparent px-2", children: ["text", "image", "voice", "video", "file"].map((t) => _jsx("option", { value: t, children: t }, t)) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-[10px] text-muted-foreground", children: "\u6D88\u606F\u5185\u5BB9" }), _jsx(Input, { value: content, onChange: (e) => setContent(e.target.value), className: "h-7 text-[11px]" })] }), _jsxs(Button, { size: "sm", onClick: handleRun, disabled: running, className: "w-full mt-1", children: [_jsx(Play, { className: "w-3.5 h-3.5 mr-1" }), " ", running ? "执行中..." : "运行"] })] }), result && (_jsxs("div", { className: "space-y-2", children: [_jsxs(Card, { className: "p-3 space-y-0.5", children: [_jsx("p", { className: "text-[10px] font-medium mb-1", children: "\u6267\u884C\u65E5\u5FD7" }), (result.logs || []).map((log, i) => (_jsx("p", { className: `text-[10px] font-mono ${log.startsWith("✓") ? "text-primary" : log.startsWith("✕") ? "text-destructive" : log.startsWith("⚠") ? "text-yellow-500" : "text-muted-foreground"}`, children: log }, i))), result.error && _jsxs("p", { className: "text-[10px] font-mono text-destructive", children: ["\u2715 ", result.error] })] }), result.permissions && (_jsxs(Card, { className: "p-3", children: [_jsx("p", { className: "text-[10px] font-medium mb-1", children: "\u89E3\u6790\u7ED3\u679C" }), _jsxs("div", { className: "text-[10px] text-muted-foreground space-y-0.5", children: [_jsxs("p", { children: ["@grant: ", (result.permissions.grants || []).join(", ") || "（未声明，默认全开）"] }), _jsxs("p", { children: ["@match: ", result.permissions.match || "*"] }), _jsxs("p", { children: ["@connect: ", result.permissions.connect || "*"] })] })] })), (result.replies || []).length > 0 && (_jsxs(Card, { className: "p-3", children: [_jsxs("p", { className: "text-[10px] font-medium mb-1", children: ["reply() \u8F93\u51FA (", result.replies.length, ")"] }), result.replies.map((r, i) => (_jsx("p", { className: "text-[10px] font-mono text-primary", children: r }, i)))] })), result.request && (_jsxs(Card, { className: "overflow-hidden", children: [_jsxs("div", { className: "px-3 py-1.5 border-b flex items-center justify-between bg-secondary/30", children: [_jsx("p", { className: "text-[10px] font-medium", children: "\u8BF7\u6C42" }), _jsxs("span", { className: "text-[10px] font-mono text-muted-foreground", children: [result.request.method, " ", result.request.url] })] }), Object.keys(result.request.headers || {}).length > 0 && (_jsx("div", { className: "px-3 py-1.5 border-b text-[10px] text-muted-foreground", children: Object.entries(result.request.headers).map(([k, v]) => (_jsxs("p", { className: "font-mono", children: [k, ": ", v] }, k))) })), _jsx("pre", { className: "px-3 py-2 text-[10px] font-mono overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap", children: tryPrettyJSON(result.request.body) })] })), result.response && (_jsxs(Card, { className: "overflow-hidden", children: [_jsxs("div", { className: "px-3 py-1.5 border-b flex items-center justify-between bg-secondary/30", children: [_jsx("p", { className: "text-[10px] font-medium", children: "\u54CD\u5E94" }), _jsx("span", { className: `text-[10px] font-mono ${result.response.status < 400 ? "text-primary" : "text-destructive"}`, children: result.response.status })] }), _jsx("pre", { className: "px-3 py-2 text-[10px] font-mono overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap", children: tryPrettyJSON(result.response.body) })] })), result.skipped && (_jsx(Card, { className: "p-3 border-yellow-500/30 bg-yellow-500/5", children: _jsx("p", { className: "text-[10px] text-yellow-500", children: "\u26A0 skip() \u88AB\u8C03\u7528 \u2014 \u90E8\u7F72\u540E\u4E0D\u4F1A\u53D1\u9001 HTTP \u8BF7\u6C42" }) }))] }))] })] })] }));
}
function tryPrettyJSON(s) {
    try {
        return JSON.stringify(JSON.parse(s), null, 2);
    }
    catch {
        return s;
    }
}
