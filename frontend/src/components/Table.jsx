import './Table.css';

export function Table({ children }) {
  return (
    <div className="table-wrapper">
      <table className="table">{children}</table>
    </div>
  );
}
export function Th({ children, ...props }) {
  return <th className="table-th" {...props}>{children}</th>;
}
export function Td({ children, ...props }) {
  return <td className="table-td" {...props}>{children}</td>;
}
