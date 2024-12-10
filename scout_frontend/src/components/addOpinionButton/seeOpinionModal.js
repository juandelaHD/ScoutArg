import React from 'react';
import './addOpinionModal.css';
import { useState, useEffect } from 'react';
import Table from '../table/table';
import { API_URL, ADMIN_ID } from '../../utils';
import BasicForm from '../basicForm/basicForm';
import LoadingSpinner from '../loadingSpinner/loadingSpinner';

function SeeOpinionModal({ item, onChange, onClose, onSubmit, onDelete, whereTo, mode }) {
    const [originalItem, setOriginalItem] = useState(null);
    const [isModalOpen1, setIsModalOpen1] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [editAvaliable, setEditAvaliable] = useState(false);
    const [error, setError] = useState(null);

    const user = JSON.parse(localStorage.getItem('current_user'));

    useEffect(() => {
        if (item && user.id === item.user_id) {
            setEditAvaliable(true);
        } else {
            setEditAvaliable(false);
        }
    }, [item, user]);

    useEffect(() => {
        if (item && !originalItem) {
            setOriginalItem(item);
        }
    }, [item]);

    if (!item) return null;

    const handleStarClick = (rating) => {
        setError('');
        onChange({ ...item, puntuacion: rating });
    };

    const handleTextChange = (e) => {
        setError('');
        onChange({ ...item, comentario: e.target.value });
    };

    const handleItemEdit = () => {
        if (
            mode === 'opinion' &&
            originalItem &&
            originalItem.comentario === item.comentario &&
            originalItem.puntuacion === item.puntuacion
        ) {
            setError('No se han realizado cambios');
            return;
        } else if (
            mode === 'comment' &&
            originalItem &&
            originalItem.comentario === item.comentario
        ) {
            setError('No se han realizado cambios');
            return;
        }

        onSubmit(item);
    };

    const openModal1 = () => setIsModalOpen1(!isModalOpen1);
    const openModal2 = () => setIsModalOpen2(!isModalOpen2);
    const closeSeeModal = () => {
        setIsModalOpen1(false);
        setIsModalOpen2(false);
        onClose();
    };

    return (
        <div className="modal-overlay">
            {isModalOpen2 && <Comment opinion={item} onClose={openModal2} whereTo={whereTo} />}
            <div className="modal">
                <>
                    {user.id === ADMIN_ID && user.id !== item.user_id && (
                        <div className="button-container">
                            <Delete 
                                opinion={item} 
                                onClose={closeSeeModal} 
                                mode={mode} 
                                onDelete={onDelete}
                            />
                        </div>
                    )}
                    <h2>
                        {editAvaliable
                            ? mode === 'opinion'
                                ? 'Editar opinión'
                                : 'Editar comentario'
                            : mode === 'opinion'
                            ? 'Opinión'
                            : 'Comentario'}
                    </h2>
                    <textarea
                        value={item.comentario}
                        onChange={(e) => editAvaliable && handleTextChange(e)}
                    />
                    {mode === 'opinion' && (
                        <div className="rating-container">
                            <label>Puntuación:</label>
                            <div className="stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        className={`star ${item.puntuacion >= star ? 'filled' : ''}`}
                                        onClick={() => editAvaliable && handleStarClick(star)}
                                    >
                                        &#9733;
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {error && <p className="error" style={{ fontSize: '20px' }}>{error}</p>}
                    {mode === 'opinion' && (
                    <div className="button-container">
                        <button onClick={openModal2}>Comentar</button>
                        <button onClick={openModal1}>Ver comentarios</button>
                    </div>
                    )}
                    {editAvaliable ? (
                        <>
                            <div className="button-container">
                                <button onClick={handleItemEdit}>Guardar Cambios</button>
                                <button onClick={closeSeeModal} className="cancel-button">
                                    Cancelar
                                </button>
                            </div>
                            <div className="button-container">
                                <Delete 
                                opinion={item} 
                                onClose={closeSeeModal} 
                                mode={mode} 
                                onDelete={onDelete}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="button-container">
                            <button onClick={closeSeeModal} className="cancel-button">
                                Salir
                            </button>
                        </div>
                    )}
                </>
            </div>
            {isModalOpen1 && <SeeComents opinion={item} whereTo={whereTo} />}
        </div>
    );
}

function SeeComents({ opinion, whereTo }) {
    const [comments, setComments] = useState([]);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('current_user'));
    const userData = JSON.parse(localStorage.getItem('current_user_data'));

    const fetchComments = async () => {
        try {
            const commentResponse = await fetch(`${API_URL}/${whereTo}/opinions/${opinion.id}/comments`);
            if (!commentResponse.ok) {
                throw new Error('Error fetching opinions');
            }
            const commentsData = await commentResponse.json();

            const formattedComments = commentsData.map(comment => ({
                user_id: comment.user_id,
                id: comment.id,
                comentario: comment.comment_text,
                created_at: comment.created_at,
                autor: comment.author,
            }));
            setComments(formattedComments);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCommentClick = (comment) => {
        setSelectedComment(comment);
        setIsModalOpen(true); 
    };

    const deleteComment = async () => {
        try {
            const response = await fetch(`${API_URL}/${whereTo}/opinions/${opinion.id}/comments/${selectedComment.id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Error deleting comment");
            } else {
                setError(null);
                setComments((prevComments) =>
                    prevComments.filter((comment) => comment.id !== selectedComment.id)
                );
                closeModal();
            }
        } catch (error) {
            console.error("Error al borrar el comentario:", error);
            setError("Error al borrar el comentario");
        }
    };

    const editComment = async (comment) => {
        setIsLoading(true);
        const json = {
            comment_text: comment.comentario,
            created_at: new Date().toISOString(),
            author: userData.name
        };

        try {
            const response = await fetch(`${API_URL}/${whereTo}/opinions/${opinion.id}/comments/${comment.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify(json),
            });

            if (response.ok) {
                await response.json();
                setError('');
                fetchComments();
                closeModal();
            } else {
                throw new Error('Error editing comment');
            }
        } catch (error) {
            console.error('Error al editar el comentario:', error);
            setError('Error al editar el comentario');
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedComment(null);
        setError(null);
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const commentColumns = [
        { name: "Autor", isImage: false },
        { name: "Comentario", isImage: false },
    ];

    return (
        <div className="modal" style={{ height: "380px", width: "400px", marginLeft: "10px" }}>
            <h2>Comentarios</h2>
            <Table
                data={comments}
                columns={commentColumns}
                onRowClick={handleCommentClick}
                redirect={true}
            />

            {isModalOpen && selectedComment && (
                <>
                {isLoading ? (
                    <div className="form-window-overlay">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <SeeOpinionModal
                        item={selectedComment}
                        onChange={setSelectedComment}
                        onClose={closeModal}
                        onSubmit={editComment}
                        onDelete={deleteComment}
                        whereTo={'teams'}
                        mode={'comment'}
                    />
                )}
                </>
            )}
            {error && <p className="error">{error}</p>}
        </div>
    );
}

function Comment({ opinion, onClose, whereTo }) {
    const [error, setError] = useState(null);
    const user = JSON.parse(localStorage.getItem('current_user'));
    const [isLoading, setIsLoading] = useState(false);
    const userData = JSON.parse(localStorage.getItem('current_user_data'));

    const handleAddComment = async (formData) => {
        setIsLoading(true);
        const { comentario } = formData;

        const json = {
            comment_text: comentario,
            created_at: new Date().toISOString(),
            author: userData.name
        };

        try {
            const response = await fetch(`${API_URL}/${whereTo}/opinions/${opinion.id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify(json),
            });

            if (response.ok) {
                await response.json();
                setError('');
                onClose()
                setIsLoading(false);
            } else {
                throw new Error('Error adding Comment');
            }
        } catch (error) {
            console.error('Error al comentar:', error);
            setError('Error al comentar');
        }
    };

    const fields = [
        { name: 'comentario', label: 'Comentario', required: true },
    ];

    if (isLoading) {
        return (
            <div className="form-window-overlay">
                <div className="form-window">
                    <h1>Creando comentario</h1>
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="modal" style={{width: "400px", marginRight: "10px"}}>
            <h2>Comentar</h2>
            <BasicForm 
                fields={fields} 
                onSubmit={handleAddComment} 
                onCancel={onClose} 
            />
            {error && <p className="error">{error}</p>}
        </div>
    );
}

function Delete({ opinion, onClose, mode, onDelete }) {
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const deleteObjet = async () => {
        setIsLoading(true);
        await onDelete(opinion);
        setIsLoading(false);
        onClose();
        closeModal();
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setError("");
    };

    if (isLoading) {
        return (
            <div className="form-window-overlay">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <>
        <button onClick={openModal} className="cancel-button">{mode === 'opinion' ? 'Borrar opinion' : 'Borrar comentario'}</button>

        {isModalOpen && (
            <div className="form-window-overlay">
                <div className="form-window">
                    <h1>{mode === 'opinion' ? 'Borrar opinion' : 'Borrar comentario'}</h1>
                    <p>¿Estas seguro que quieres borrar {mode === 'opinion' ? 'esta opinión' : 'este comentario'}?</p>
                    <BasicForm
                    onSubmit={deleteObjet}
                    onCancel={closeModal}
                    fields={[]}
                    setImage={false}
                    />
                    {error && <p className="error">{error}</p>}
                </div>
            </div>
        )}
        </>
    );
}

export default SeeOpinionModal;
