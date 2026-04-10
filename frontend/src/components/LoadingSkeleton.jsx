export default function LoadingSkeleton({ width = '100%', height = 16, borderRadius = 6 }) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #DDE8EC 25%, #F2F8FA 50%, #DDE8EC 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      display: 'inline-block',
    }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  )
}
