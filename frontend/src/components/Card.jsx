import './Card.css';

export default function Card({ children, className = '', padding = true, style }) {
  return (
    <div className={`card ${padding ? 'card-padded' : ''} ${className}`} style={style}>
      {children}
    </div>
  );
}
