import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Plus, Trash2, RefreshCw, Bot } from "lucide-react";
import { api } from "../lib/api";
const statusVariant = {
    connected: "default", disconnected: "outline", error: "destructive", session_expired: "destructive",
};
export function BotsPage() {
    const [bots, setBots] = useState([]);
    const [channels, setChannels] = useState([]);
    const [binding, setBinding] = useState(false);
    const [qrUrl, setQrUrl] = useState("");
    const [bindStatus, setBindStatus] = useState("");
    const [hasGlobalAI, setHasGlobalAI] = useState(false);
    const [enableAI, setEnableAI] = useState(false);
    async function load() {
        const b = await api.listBots();
        setBots(b || []);
        // Load channels for all bots
        const allChannels = [];
        for (const bot of (b || [])) {
            const chs = await api.listChannels(bot.id);
            allChannels.push(...(chs || []));
        }
        setChannels(allChannels);
    }
    useEffect(() => {
        load();
        api.info().then((f) => { setHasGlobalAI(f.ai); setEnableAI(f.ai); }).catch(() => { });
    }, []);
    async function startBind() {
        setBinding(true);
        setBindStatus("获取二维码...");
        try {
            const { session_id, qr_url } = await api.bindStart();
            setQrUrl(qr_url);
            setBindStatus("请用微信扫描二维码");
            const es = new EventSource(`/api/bots/bind/status/${session_id}${enableAI ? "?enable_ai=true" : ""}`);
            es.addEventListener("status", (e) => {
                const data = JSON.parse(e.data);
                if (data.status === "scanned")
                    setBindStatus("已扫码，请在微信确认...");
                if (data.status === "refreshed") {
                    setQrUrl(data.qr_url);
                    setBindStatus("二维码已刷新");
                }
                if (data.status === "connected") {
                    setBindStatus("绑定成功！");
                    es.close();
                    setTimeout(() => { setBinding(false); setQrUrl(""); load(); }, 1000);
                }
            });
            es.addEventListener("error", () => { setBindStatus("绑定失败"); es.close(); });
        }
        catch (err) {
            setBindStatus("失败: " + err.message);
        }
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-lg font-semibold", children: "Bot \u7BA1\u7406" }), _jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "\u7BA1\u7406\u4F60\u7684\u5FAE\u4FE1 Bot\uFF0C\u626B\u7801\u7ED1\u5B9A\u65B0 Bot" })] }), !binding && (_jsxs(Button, { onClick: startBind, variant: "outline", size: "sm", children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), " \u7ED1\u5B9A\u65B0 Bot"] }))] }), binding ? (_jsxs(Card, { className: "flex flex-col items-center gap-4 py-8", children: [_jsx(QrCanvas, { url: qrUrl }), _jsx("p", { className: "text-sm text-muted-foreground", children: bindStatus }), hasGlobalAI && (_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: enableAI, onChange: (e) => setEnableAI(e.target.checked), className: "w-3.5 h-3.5 accent-primary" }), _jsx(Bot, { className: "w-3.5 h-3.5 text-muted-foreground" }), _jsx("span", { className: "text-xs text-muted-foreground", children: "\u81EA\u52A8\u5F00\u542F\u5185\u7F6E AI \u56DE\u590D" })] })), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => { setBinding(false); setQrUrl(""); }, children: "\u53D6\u6D88" })] })) : null, bots.map((bot) => (_jsx(BotCard, { bot: bot, channelCount: (channels || []).filter((c) => c.bot_id === bot.id).length, onRefresh: load }, bot.id))), bots.length === 0 && !binding && (_jsx("p", { className: "text-center text-sm text-muted-foreground py-8", children: "\u70B9\u51FB\u4E0A\u65B9\u6309\u94AE\u7ED1\u5B9A\u4F60\u7684\u7B2C\u4E00\u4E2A Bot" }))] }));
}
function QrCanvas({ url }) {
    const ref = useRef(null);
    useEffect(() => {
        if (!url || !ref.current)
            return;
        QRCode.toCanvas(ref.current, url, { width: 224, margin: 2, color: { dark: "#000", light: "#fff" } });
    }, [url]);
    if (!url)
        return null;
    return _jsx("canvas", { ref: ref, className: "rounded-lg" });
}
function BotCard({ bot, channelCount, onRefresh }) {
    const navigate = useNavigate();
    async function handleDelete(e) {
        e.stopPropagation();
        if (!confirm("删除此 Bot 及其所有通道？"))
            return;
        await api.deleteBot(bot.id);
        onRefresh();
    }
    async function handleReconnect(e) {
        e.stopPropagation();
        await api.reconnectBot(bot.id);
        onRefresh();
    }
    return (_jsxs(Card, { className: "flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors", onClick: () => navigate(`/dashboard/bot/${bot.id}`), children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: bot.name }), _jsx("p", { className: "text-xs text-muted-foreground font-mono mt-0.5", children: bot.extra?.bot_id }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsxs("span", { className: "text-xs text-muted-foreground", children: [channelCount, " \u4E2A\u901A\u9053"] }), bot.status === "session_expired" && (_jsx("span", { className: "text-[10px] text-destructive", children: "\u4F1A\u8BDD\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u626B\u7801\u7ED1\u5B9A" }))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: statusVariant[bot.status] || "outline", children: bot.status === "session_expired" ? "已过期" : bot.status }), bot.status !== "connected" && bot.status !== "session_expired" && (_jsx(Button, { variant: "ghost", size: "sm", onClick: handleReconnect, children: _jsx(RefreshCw, { className: "w-3.5 h-3.5" }) })), _jsx(Button, { variant: "ghost", size: "sm", onClick: handleDelete, children: _jsx(Trash2, { className: "w-3.5 h-3.5 text-destructive" }) })] })] }));
}
