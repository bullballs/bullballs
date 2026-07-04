export default function BullBallsIcon({ className }) {
  return (
    <img
      src="/balls.png"
      alt="Bull Balls"
      draggable={false}
      className={`select-none object-contain ${className ?? ''}`}
    />
  );
}
