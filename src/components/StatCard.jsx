import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import './shared/shared.css';

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = '#0c7e6f',
  trend,
}) {
  return (
    <Card className="metric-card">
      <CardHeader className="metric-card-header">
        <CardTitle className="metric-card-title">{title}</CardTitle>
        {Icon ? <Icon style={{ color: iconColor }} className="metric-card-icon" /> : null}
      </CardHeader>
      <CardContent className="metric-card-content">
        <div className="metric-card-value">{value}</div>
        {trend ? (
          <div className={`metric-card-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
            {trend.value}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
