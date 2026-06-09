'use client';
import { formatFileSize } from '@/lib/utils';
import './admin.css';

export default function AnalyticsCharts({ data }) {
  if (!data) return null;
  const { totalUsers = 0, totalMedia = 0, totalEvents = 0, totalStorage = 0, totalImages = 0, totalVideos = 0, topUploaders = [], uploadTrends = [], roleDistribution = [] } = data;
  const maxTrend = Math.max(...uploadTrends.map(t => t.count), 1);

  return (
    <div className="analytics-charts">
      <div className="analytics-stats-row">
        {[
          { label: 'Total Users', value: totalUsers, icon: '👥', color: '#3D8BFF' },
          { label: 'Total Media', value: totalMedia, icon: '📸', color: '#00C853' },
          { label: 'Total Events', value: totalEvents, icon: '🎉', color: '#FF6B35' },
          { label: 'Storage Used', value: formatFileSize(totalStorage), icon: '💾', color: '#9C27B0' },
        ].map((stat, i) => (
          <div key={i} className="analytics-stat-card" style={{ '--stat-color': stat.color }}>
            <span className="analytics-stat-icon">{stat.icon}</span>
            <span className="analytics-stat-value">{stat.value}</span>
            <span className="analytics-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>📈 Upload Trends (30 Days)</h3>
          <div className="analytics-bar-chart">
            {uploadTrends.slice(-14).map((day, i) => (
              <div key={i} className="bar-col">
                <div className="bar" style={{ height: `${(day.count / maxTrend) * 100}%` }} title={`${day.count} uploads`} />
                <span className="bar-label">{day._id?.slice(-2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3>📊 Media Distribution</h3>
          <div className="analytics-pie">
            <div className="pie-chart" style={{ '--images-pct': `${totalMedia ? (totalImages / totalMedia) * 100 : 50}%` }}>
              <div className="pie-center">
                <span className="pie-total">{totalMedia}</span>
                <span className="pie-label">Total</span>
              </div>
            </div>
            <div className="pie-legend">
              <span className="pie-legend-item"><span className="pie-dot images" /> Images ({totalImages})</span>
              <span className="pie-legend-item"><span className="pie-dot videos" /> Videos ({totalVideos})</span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>🏆 Top Uploaders</h3>
          <div className="top-uploaders-list">
            {topUploaders.slice(0, 5).map((u, i) => (
              <div key={i} className="top-uploader-item">
                <span className="top-uploader-rank">#{i + 1}</span>
                <div className="top-uploader-avatar">{u.name?.[0] || '?'}</div>
                <span className="top-uploader-name">{u.name}</span>
                <span className="top-uploader-count">{u.count} uploads</span>
              </div>
            ))}
            {topUploaders.length === 0 && <p className="analytics-empty">No data yet</p>}
          </div>
        </div>

        <div className="analytics-card">
          <h3>👥 Role Distribution</h3>
          <div className="role-distribution">
            {roleDistribution.map((r, i) => (
              <div key={i} className="role-bar-item">
                <span className="role-bar-label">{r._id}</span>
                <div className="role-bar-track">
                  <div className="role-bar-fill" style={{ width: `${totalUsers ? (r.count / totalUsers) * 100 : 0}%` }} />
                </div>
                <span className="role-bar-count">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
