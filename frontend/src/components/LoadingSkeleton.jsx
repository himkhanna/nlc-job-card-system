export default function LoadingSkeleton({ width = '100%', height = 16, borderRadius = 6 }) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #E8ECF2 25%, #F4F6FA 50%, #E8ECF2 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      display: 'inline-block',
    }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  )
}
