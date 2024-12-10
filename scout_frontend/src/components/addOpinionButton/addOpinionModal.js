import React, { useState } from 'react';
import './addOpinionModal.css';

function AddOpinionModal({ isOpen, onClose, onSubmit }) {
    const [opinion, setOpinion] = useState('');
    const [puntuacion, setPuntuacion] = useState(1);

    const handleStarClick = (rating) => {
        setPuntuacion(rating);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(opinion, puntuacion);
        setOpinion('');
        setPuntuacion(1);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Agregar Opinión</h2>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={opinion}
                        onChange={(e) => setOpinion(e.target.value)}
                        placeholder="Escribe tu opinión..."
                        required
                    />
                    <div className="rating-container">
                        <h3>Puntuación:</h3>
                        <div className="stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`star ${puntuacion >= star ? 'filled' : ''}`}
                                    onClick={() => handleStarClick(star)}
                                >
                                    &#9733;
                                </span>
                            ))}
                        </div>
                    </div>
                    <div  className="button-container">
                        <button type="submit">Enviar Opinión</button>
                        <button type="button" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddOpinionModal;
