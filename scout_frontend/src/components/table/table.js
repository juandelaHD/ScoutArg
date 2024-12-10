import React from "react";
import "./table.css";

function StarRating({ rating }) {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span key={i} className={`star ${i < rating ? "filled" : ""}`}>
        ★
      </span>
    );
  }
  return <div>{stars}</div>;
}

function mapStrings(str) {
    switch (str) {
        case 'Comentarios': return 'comentario';
        default: return str.toLowerCase();
    }
}

function Table({ data, columns, onRowClick, onImageError, redirect }) {
    return (
        <div className="table-container">
            <table className="table">
                <thead className="table-head">
                    <tr className="column-names">
                        {columns.map((col, index) => (
                            <th key={index}>{col.name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="table-body">
                    {data.map((row, index) => (
                        <tr 
                            className={`table-card ${redirect ? 'pointer-cursor' : ''}`}
                            key={index} 
                            onClick={redirect ? () => onRowClick(row) : null}
                        >
                            {columns.map((col, i) => (
                                <td key={i}>
                                    {col.isImage ? (
                                        row[col.name.toLowerCase()] ? (
                                            <div className="table-card-logo">
                                                <img
                                                  src={
                                                    row[col.name.toLowerCase()] +
                                                    `?${new Date().getTime()}`
                                                  }
                                                  alt={col.name}
                                                  onError={onImageError}
                                                />
                                            </div>
                                        ) : (
                                            <div className="table-card-logo">
                                                <img 
                                                    src="/logo192.png"
                                                    alt="default" 
                                                />
                                            </div>
                                        )
                                    ) : col.name === 'Puntuación' ? (
                                        <StarRating rating={row.puntuacion} />
                                    ) : col.name === 'Equipo' ? (
                                        <div className="table-card-subcontainer">
                                            {row.team? row.team.name : 'Sin equipo'} 
                                        </div>
                                    ) : (
                                        <div className="table-card-subcontainer">
                                            {row[mapStrings(col.name)]}
                                        </div>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
