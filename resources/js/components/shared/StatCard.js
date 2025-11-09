import React from 'react';

export default function StatCard({ title, value, delta, iconBg, iconDot }) {
    return (
        <div style={{ 
            background: '#fff', 
            borderRadius: 12, 
            padding: '20px', 
            border: '1px solid #e5e7eb', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'flex-start'
        }}>
            <div>
                <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>{title}</div>
                <div style={{ fontWeight: 700, fontSize: 32, marginBottom: 8, color: '#1a1a1a' }}>{value}</div>
                <div style={{ color: '#16a34a', fontSize: 12, fontWeight: 500 }}>{delta}</div>
            </div>
            <div style={{ 
                width: 48, 
                height: 48, 
                background: iconBg, 
                borderRadius: 10, 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                <div style={{ 
                    width: 24, 
                    height: 24, 
                    background: iconDot, 
                    borderRadius: 6
                }}></div>
            </div>
        </div>
    );
}

