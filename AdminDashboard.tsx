import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Users, Clock, AlertTriangle, Bus as BusIcon } from 'lucide-react';

const data = [
  { name: '06:00', delay: 2, crowd: 20 },
  { name: '08:00', delay: 15, crowd: 85 },
  { name: '10:00', delay: 10, crowd: 60 },
  { name: '12:00', delay: 5, crowd: 40 },
  { name: '14:00', delay: 8, crowd: 55 },
  { name: '16:00', delay: 20, crowd: 90 },
  { name: '18:00', delay: 25, crowd: 95 },
  { name: '20:00', delay: 12, crowd: 50 },
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<BusIcon className="text-emerald-600" />} label="Active Buses" value="142" delta="+4" />
        <StatCard icon={<Users className="text-blue-600" />} label="Avg. Occupancy" value="68%" delta="+12%" />
        <StatCard icon={<Clock className="text-amber-600" />} label="Avg. Delay" value="8.4m" delta="-1.2m" />
        <StatCard icon={<AlertTriangle className="text-red-600" />} label="Incidents" value="2" delta="0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Delay Trends (Minutes)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="delay" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Crowd Density (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="crowd" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.crowd > 80 ? '#ef4444' : entry.crowd > 50 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Live Alerts</h3>
        <div className="space-y-3">
          <AlertItem type="warning" title="Route Diversion" desc="Bus 216 diverted via Hitech City due to construction." time="2m ago" />
          <AlertItem type="danger" title="Overspeeding" desc="Bus TS09UA1234 exceeded 65km/h on Miyapur flyover." time="15m ago" />
          <AlertItem type="info" title="Route Optimized" desc="Route 218 updated with 2 new stops near Koti." time="1h ago" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, delta }: { icon: React.ReactNode, label: string, value: string, delta: string }) {
  const isPositive = delta.startsWith('+');
  const isNegative = delta.startsWith('-');
  
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className="p-3 bg-slate-50 rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-xl font-bold text-slate-900">{value}</h4>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            isPositive ? 'bg-emerald-50 text-emerald-600' : 
            isNegative ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
          }`}>
            {delta}
          </span>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ type, title, desc, time }: { type: 'warning' | 'danger' | 'info', title: string, desc: string, time: string }) {
  const colors = {
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    danger: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800'
  };

  return (
    <div className={`p-3 rounded-xl border ${colors[type]} flex justify-between items-start`}>
      <div>
        <h5 className="font-bold text-sm">{title}</h5>
        <p className="text-xs opacity-80">{desc}</p>
      </div>
      <span className="text-[10px] font-medium opacity-60 whitespace-nowrap">{time}</span>
    </div>
  );
}
