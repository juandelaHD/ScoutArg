import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Table from '../table/table';
import SearchBar from '../searchBar/searchBar';
import LoadingSpinner from '../loadingSpinner/loadingSpinner';
import AddOpinionModal from '../addOpinionButton/addOpinionModal';
import './teamPage.css';
import { API_URL, ADMIN_ID } from '../../utils';
import { useSupabase } from '../../supabaseContext'
import BasicForm from '../basicForm/basicForm';
import SeeOpinionModal from '../addOpinionButton/seeOpinionModal';

function TeamPage() {
    const { teamId } = useParams();
    const { supabase } = useSupabase();
    const [teamData, setTeamData] = useState({ nombre: '', escudo: '' });
    const [players, setPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState('Jugadores');
    const [opinions, setOpinions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [selectedOpinion, setSelectedOpinion] = useState(null);
    const [follow, setFollow] = useState(false);
    const user = JSON.parse(localStorage.getItem("current_user"));
    const userData = JSON.parse(localStorage.getItem("current_user_data"));

    const fetchOpinions = async () => {
        setLoading(true);
        try {
            const opinionsResponse = await fetch(
              `${API_URL}/teams/${teamId}/opinions`
            );
            if (!opinionsResponse.ok) throw new Error("Error fetching opinions");
            const opinionsData = await opinionsResponse.json();
            const formattedOpinions = opinionsData.map((opinion) => ({
                created_at: opinion.created_at,
                id: opinion.id,
                comentario: opinion.opinion_text,
                player_id: opinion.player_id,
                puntuacion: opinion.rating,
                user_id: opinion.user_id,
                autor: opinion.author,
            }));
            setOpinions(formattedOpinions);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            const playersResponse = await fetch(`${API_URL}/teams/${teamId}/players`);
            if (!playersResponse.ok){
                throw new Error("Error fetching players");
            }
            const playersData = await playersResponse.json();
            const formattedPlayers = await Promise.all(
                playersData.map(async (player) => {
                    const playersRes = await fetch(`${API_URL}/players/${player}`);
                    if (!playersRes.ok) {
                        throw new Error("Error fetching player data");
                    }

                    const playerData = await playersRes.json();
                    const { data: imageData } = await supabase.storage
                        .from("player-pictures")
                        .getPublicUrl(playerData.id);
                    const response = await fetch(imageData.publicUrl);
                    if (!response.ok) {
                        imageData.publicUrl = null;
                    }
                    return {
                        edad: playerData.age,
                        nombre: playerData.name,
                        numero: playerData.number,
                        posicion: playerData.position,
                        id: playerData.id,
                        foto: imageData.publicUrl,
                    };
                })
            );
            setPlayers(formattedPlayers);
            setFilteredPlayers(formattedPlayers);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch team data
            const teamResponse = await fetch(`${API_URL}/teams/${teamId}`);
            if (!teamResponse.ok) {
                throw new Error("Error fetching team data");
            }
            const teamData = await teamResponse.json();

            const { data, error } = await supabase.storage
                .from("team-pictures")
                .getPublicUrl(teamData.id);
            const response = await fetch(data.publicUrl);
            if (!response.ok) {
                data.publicUrl = null;
            }
            setTeamData({
                escudo: data.publicUrl,
                nombre: teamData.name,
                seguidores: teamData.users,
            });
            // Fetch players
            await fetchPlayers();
            // Fetch opinions
            await fetchOpinions();
        } catch (err) {
            console.error(err);
        } finally {
            if (userData.team_id && userData.team_id === teamId) {
              setFollow(true);
            }
            setLoading(false);
        }
    };

  const handleFollowTeam = async () => {
    const json = {};

    if (userData.team_id === teamId) {
        json.team_id = null;
        userData.team_id = null;
    } else if (userData.team_id) {
        alert(`Ya sigues a "${userData.team.name}", por favor deja de seguirlo antes de seguir a otro equipo`);
        return;
    } else {
        json.team_id = teamId;
        userData.team_id = teamId;
    }

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(json),
      });

      if (response.ok) {
        await response.json();
      } else {
        throw new Error("Error following Team");
      }
    } catch (error) {
      setError("Error al seguir el equipo");
    } finally {
      setFollow(true);
      localStorage.setItem('current_user_data', JSON.stringify({ ...userData, team_id: userData.team_id }));
      navigate(`/teams/${teamId}/${teamData.nombre}`);
      window.location.reload();
    }
  };

  useEffect(() => {
    fetchData();
  }, [teamId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const handleSearch = (query) => {
    setSearch(query);
    const filtered = players.filter((player) =>
      player.nombre.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPlayers(filtered);
  };

  const handlePlayerClick = (player) => {
    navigate(`/teams/${teamData.nombre}/${player.id}/${player.nombre}`);
  };

  const handleOpinonSubmit = async (opinion, puntuacion) => {
      const json = {
          user_id: user.id,
          opinion_text: opinion,
          rating: puntuacion,
          team_id: teamId,
          created_at: new Date().toISOString(),
          author: userData.name
      };

      try {
          const response = await fetch(`${API_URL}/teams/opinions`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${user.token}`,
              },
              body: JSON.stringify(json),
          });

          if (response.ok) {
              await fetchOpinions(); 
          } else {
              throw new Error('Error adding opinion');
          }
      } catch (err) {
          setError(err.message);
      }
  };

    const hanldeEditOpinion = async (opinion) => {
        const json = {
            user_id: user.id,
            opinion_text: opinion.comentario,
            rating: opinion.puntuacion,
            team_id: teamId,
            created_at: new Date().toISOString(),
            author: userData.name
        };

        try {
            const response = await fetch(`${API_URL}/teams/opinions/${opinion.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify(json),
            });

            if (response.ok) {
                await fetchOpinions(); 
            } else {
                throw new Error('Error adding opinion');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSelectedOpinion(null);
            window.location.reload();
        }
    };

  const handleOpinionClick = (opinion) => {
    setSelectedOpinion(opinion);
  }

  const handleDeleteOpinion = async (opinion) => {
    try {
        const response = await fetch(`${API_URL}/teams/opinions/${opinion.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Error deleting opinion");
        }

        await response.json();
    } catch (error) {
        console.error("Error al borrar la opinion:", error);
    } finally {
        window.location.reload();
    }
  };

  const handleStarClick = () => {
    handleFollowTeam();
  };

  const closeOpinionForm = () => {
    setSelectedOpinion(null);
  };

  const playerColumns = [
    { name: "Foto", isImage: true },
    { name: "Nombre", isImage: false },
    { name: "Posicion", isImage: false },
    { name: "Numero", isImage: false },
    { name: "Edad", isImage: false },
  ];
  const opinionColumns = [
    { name: "Autor", isImage: false },
    { name: "Comentario", isImage: false },
    { name: "Puntuación", isImage: false },
  ];

    return (
        <section className="team-page">
            <header className="team-header">
                <img
                    src={teamData.escudo + `?${new Date().getTime()}`}
                    alt={`${teamData.nombre} escudo`}
                    className="team-logo"
                    onError={(e) => {
                        e.target.src = "/logo512.png";
                    }}
                />
                <h1 className="team-name">{teamData.nombre}</h1>
                <div className="rating-container">
                    <div className="stars" onClick={() => handleStarClick()} style={{cursor: "pointer"}}>
                        <h3 className="followers" style={{marginRight: "50px"}}>Seguidores: {teamData.seguidores.length}</h3>
                        {[1].map((star) => (
                            <span
                                key={star}
                                className={`star ${follow ? 'filled' : ''}`}
                            >
                                &#9733;
                            </span>
                        ))}
                        <h3 className="team-name" style={{ textDecoration: 'underline' }}>Seguir</h3>
                    </div>
                </div>
            </header>

            {error && <p className="error">{error}</p>}
            
            <div className="display-table-options">
                <button
                    className={`display-table-option ${selectedOption === 'Jugadores' ? '' : 'active'}`}
                    onClick={() => setSelectedOption('Jugadores')}
                >
                    Jugadores
                </button>
                <button
                    className={`display-table-option ${selectedOption === 'Opiniones' ? '' : 'active'}`}
                    onClick={() => setSelectedOption('Opiniones')}
                >
                    Opiniones
                </button>
            </div>
            {selectedOption === 'Opiniones' && (
                <>
                    <div style={{width: "60%"}}>
                        <Table 
                            data={opinions} 
                            columns={opinionColumns} 
                            onRowClick={handleOpinionClick} 
                            redirect={true}
                        />
                    </div>
                    <button 
                        className="add-opinion-btn"
                        onClick={() => setIsModalOpen(true)}
                    >
                        OPINAR
                    </button>

                    <AddOpinionModal 
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleOpinonSubmit}
                    />

                    <SeeOpinionModal
                        item={selectedOpinion}
                        onChange={setSelectedOpinion}
                        onClose={closeOpinionForm}
                        onSubmit={hanldeEditOpinion}
                        onDelete={handleDeleteOpinion}
                        whereTo={'teams'}
                        mode={'opinion'}
                    />
                </>
            )}
            {selectedOption === 'Jugadores' && (
                <>
                    <SearchBar 
                        placeholder="Buscar jugador..." 
                        value={search} 
                        onSearch={handleSearch} 
                    />
                    <div style={{width: "60%"}}>
                        <Table 
                            data={filteredPlayers} 
                            columns={playerColumns} 
                            onRowClick={handlePlayerClick} 
                            onImageError={(e) => { e.target.src = '/jugador.png'; }}
                            redirect={true}
                        />
                    </div>
                    <div className="button-container">
                        <AdminAddPlayerModal fetchPlayers={ fetchPlayers } />
                    </div>
                </>
            )}
            <div className="button-container">
                <AdminEditTeamModal teamData={teamData} />
                <AdminDeleteTeamModal teamData={teamData} />
            </div>
        </section>
    );
}

function AdminEditTeamModal({ teamData }) {
  const [error, setError] = useState("");
  const { teamId } = useParams();
  const user = JSON.parse(localStorage.getItem("current_user"));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { supabase } = useSupabase();
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  if (user.id !== ADMIN_ID) {
    return null;
  }

  const uploadTeamImage = async (teamId) => {
    if (!file) {
      setError("Por favor selecciona un archivo para subir");
      return;
    }
    try {
      if (teamData.escudo !== null) {
        // EDIT
        await supabase.storage
          .from("team-pictures")
          .update(teamId, file, {
            metadata: {
              owner_id: user.id,
            },
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
        if (error) {
          throw new Error("Error updating Team Image");
        }
      } else {
        // POST
        await supabase.storage
          .from("team-pictures")
          .upload(`${teamId}`, file, {
            metadata: {
              owner_id: user.id,
            },
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
        if (error) {
          throw new Error("Error uploading Team Image");
        }
      }
    } catch (error) {
      setError("Error al cargar la imagen del equipo");
    }
  };

  const handleEditTeam = async (formData) => {
    const { teamName } = formData;

    const json = {
      name: teamName,
    };

    try {
      const response = await fetch(`${API_URL}/teams/${teamId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(json),
      });

      if (response.ok) {
        await response.json();
        if (file) {
          await uploadTeamImage(teamId);
        }
      } else {
        console.error("Error al editar el equipo:");
        throw new Error("Error edditing Team");
      }
    } catch (error) {
      console.error("Error al editar el equipo:", error);
      setError("Error al editar el equipo");
    } finally {
      setError("");
      closeModal();
      navigate(`/teams/${teamId}/${teamName}`);
      window.location.reload();
    }
  };

  const fields = [
    {
      name: "teamName",
      label: "Nombre del equipo",
      value: `${teamData.nombre}`,
      required: false,
    },
    { name: "foto", label: "Seleccionar escudo", required: false },
  ];

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setFile(null);
    setError("");
  };

  return (
    <>
      <button onClick={openModal}>Editar equipo</button>

      {isModalOpen && (
        <div className="form-window-overlay">
          <div className="form-window">
            <h1>Editar equipo</h1>
            <BasicForm
              fields={fields}
              onSubmit={handleEditTeam}
              onCancel={closeModal}
              setFile={setFile}
            />
            {error && <p className="error">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}

function AdminDeleteTeamModal({ teamData }) {
  const { teamId } = useParams();
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("current_user"));
  const navigate = useNavigate();

  if (user.id !== ADMIN_ID) {
    return null;
  }

  const handleDeleteTeam = async () => {
    try {
      const response = await fetch(`${API_URL}/teams/${teamId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error deleting Team");
      }

      await response.json();

      setError("");
      closeModal();
    } catch (error) {
      console.error("Error al borrar el equipo:", error);
      setError("Error al  al borrar el equipo");
    }
    navigate("/teams");
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
  };

  return (
    <>
      <button onClick={openModal} className="cancel-button">Borrar equipo</button>

      {isModalOpen && (
        <div className="form-window-overlay">
          <div className="form-window">
            <h1>Borrar equipo</h1>
            <p>¿Estas seguro que quieres borrar a "{teamData.nombre}"?</p>
            <BasicForm
              onSubmit={handleDeleteTeam}
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

function AdminAddPlayerModal() {
    const { supabase } = useSupabase();
    const { teamId, teamName } = useParams();
    const [players, setPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [playerSearch, setPlayerSearch] = useState('')
    const [isLoading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("current_user"));

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/players/without-team`);
            if (!response.ok) {
                throw new Error('Error al obtener los jugadores');
            }
            const playerData = await response.json();
            const formattedPlayers = await Promise.all(playerData.map(async (player) => {
                const { data: imageData } = await supabase.storage
                        .from("player-pictures")
                        .getPublicUrl(player.id);
                const response = await fetch(imageData.publicUrl);
                if (!response.ok) {
                    imageData.publicUrl = null;
                }
                return {
                    edad: player.age,
                    nombre: player.name,
                    numero: player.number,
                    posicion: player.position,
                    id: player.id,
                    foto: imageData.publicUrl,
                };
            }));

            setPlayers(formattedPlayers);
            setFilteredPlayers(formattedPlayers);
        } catch (error) {
            console.error('Error fetching teams:', error);
        } finally {
            setPlayerSearch('');
            setLoading(false);
        }  
    };  

    const handlePlayerSearch = (query) => {
        setPlayerSearch(query);
        const filtered = players.filter(player => player.nombre.toLowerCase().includes(query.toLowerCase()));
        setFilteredPlayers(filtered);
    };

    const handlePlayerClick = async (player) => {
        const json = {
            team_id: teamId,
        };
    
        try {
            const response = await fetch(`${API_URL}/players/${player.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify(json),
            });
      
            if (response.ok) {
                await response.json();
            } else {
                console.error("Error al agregar el jugador al equipo:");
                throw new Error("Error edditing player");
            }
        } catch (error) {
            console.error("Error al agregar el jugador al equipo:", error);
            setError("Error al agregar el jugador al equipo");
        } finally {
            setError("");
            setIsModalOpen(false);
            navigate(`/teams/${teamId}/${teamName}`);
            window.location.reload();
        }
    }

    const openModal = () => {
      setIsModalOpen(true)
      fetchPlayers()
    };

    const closeModal = () => {
        setLoading(false);
        setIsModalOpen(false);
        setError("");
    };

    const playerColumns = [
        { name: "Foto", isImage: true },
        { name: "Nombre", isImage: false },
        { name: "Posicion", isImage: false },
        { name: "Numero", isImage: false },
        { name: "Edad", isImage: false },
    ];

    return (
        <>
            <button onClick={() => openModal()}>Agregar jugador</button>
    
            {isModalOpen && (
                isLoading ? 
                    <div className="form-window-overlay">
                        <div className="form-window">
                            <LoadingSpinner />
                        </div>
                    </div> 
                    : (
                    <div className="form-window-overlay">
                        <div className="form-window" style={{margin: 'auto', width: '600px'}}>
                            <h1>Agregar jugador</h1>
                            <SearchBar 
                                placeholder="Buscar jugador..." 
                                value={playerSearch} 
                                onSearch={handlePlayerSearch} 
                            />
                            <Table 
                                data={filteredPlayers} 
                                columns={playerColumns} 
                                onRowClick={handlePlayerClick} 
                                onImageError={(e) => { e.target.src = '/jugador.png'; }}
                                redirect={true}
                            />
                            <div className="button-container">
                                <button onClick={closeModal} className="cancel-button">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            )}
            {error && <p className="error">{error}</p>}
        </>
    );
  
}

export default TeamPage;
