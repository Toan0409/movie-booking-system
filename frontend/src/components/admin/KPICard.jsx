import {
    TrendingUp,
    TrendingDown
} from "lucide-react";

const colorMap = {
    blue: {
        text: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        hover: "group-hover:bg-blue-400/20"
    },
    amber: {
        text: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        hover: "group-hover:bg-amber-400/20"
    },
    indigo: {
        text: "text-indigo-400",
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20",
        hover: "group-hover:bg-indigo-400/20"
    },
    emerald: {
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        hover: "group-hover:bg-emerald-400/20"
    },
    rose: {
        text: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        hover: "group-hover:bg-rose-400/20"
    },
    purple: {
        text: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        hover: "group-hover:bg-purple-400/20"
    }
};

const KPICard = ({
    title,
    value,
    change,
    trend = "up", // 'up' | 'down'
    icon: Icon,
    color = "blue"
}) => {
    const c = colorMap[color] || colorMap.blue;

    return (
        <div className="group p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/10 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 hover:border-white/20">

            {/* Top */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-2">
                        {title}
                    </p>
                    <h3 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                        {value}
                    </h3>
                </div>

                {/* Icon */}
                <div className={`p-3 rounded-2xl ${c.bg} ${c.border} ${c.hover} transition-all backdrop-blur-lg border`}>
                    {Icon && <Icon className={`w-6 h-6 ${c.text}`} />}
                </div>
            </div>

            {/* Bottom */}
            <div className="flex items-center text-xs">
                <span className={`font-bold flex items-center gap-1 ${trend === "down" ? "text-rose-400" : "text-emerald-400"}`}>

                    {trend === "down" ? (
                        <TrendingDown className="w-4 h-4" />
                    ) : (
                        <TrendingUp className="w-4 h-4" />
                    )}

                    {change}
                </span>

                <span className="ml-2 text-white/50 font-medium">
                    vs last month
                </span>
            </div>
        </div>
    );
};

export default KPICard;