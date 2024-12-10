import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Table from "../table/table";
import AddOpinionModal from "../addOpinionButton/addOpinionModal";
import "./playerPage.css";
import { API_URL, ADMIN_ID } from "../../utils";
import LoadingSpinner from "../loadingSpinner/loadingSpinner";
import { useSupabase } from "../../supabaseContext";
import BasicForm from "../basicForm/basicForm";
import SeeOpinionModal from "../addOpinionButton/seeOpinionModal";

function PlayerPage() {
  const { playerId } = useParams();
  const { supabase } = useSupabase();
  const [playerData, setPlayerData] = useState({
    foto: "",
    nombre: "",
    posicion: "",
    numero: "",
    edad: "",
  });
  const [opinions, setOpinions] = useState([]);
  const [selectedOpinion, setSelectedOpinion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("current_user"));
  const userData = JSON.parse(localStorage.getItem("current_user_data"));

  const fetchOpinions = async () => {
    setLoading(true);
    try {
      const opinionsResponse = await fetch(
        `${API_URL}/players/${playerId}/opinions`
      );
      if (!opinionsResponse.ok) {
        throw new Error("Error fetching opinions");
      }
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

  useEffect(() => {
    const fetchPlayerData = async () => {
      setLoading(true);
      try {
        const playerResponse = await fetch(`${API_URL}/players/${playerId}`);
        if (!playerResponse.ok) {
          throw new Error("Error fetching player data");
        }
        const playerData = await playerResponse.json();

        const { data } = await supabase.storage
          .from("player-pictures")
          .getPublicUrl(playerData.id);
        const response = await fetch(data.publicUrl);
        if (!response.ok) {
          data.publicUrl = null;
        }
        setPlayerData({
          foto: data.publicUrl,
          nombre: playerData.name,
          posicion: playerData.position,
          numero: playerData.number,
          id: playerData.id,
          edad: playerData.age,
          team: playerData.team,
        });

        await fetchOpinions();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId]);

  const handleSubmit = async (opinion, puntuacion) => {
    const json = {
      opinion_text: opinion,
      rating: puntuacion,
      player_id: playerId,
      created_at: new Date().toISOString(),
      author: userData.name,
    };

    const user = JSON.parse(localStorage.getItem("current_user"));

    try {
      const response = await fetch(`${API_URL}/players/opinions`, {
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
        throw new Error("Error adding opinion");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const hanldeEditOpinion = async (opinion) => {
    const json = {
      opinion_text: opinion.comentario,
      rating: opinion.puntuacion,
      player_id: playerId,
      created_at: new Date().toISOString(),
      author: userData.name,
    };

    try {
      const response = await fetch(
        `${API_URL}/players/opinions/${opinion.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(json),
        }
      );

      if (response.ok) {
        await fetchOpinions();
      } else {
        throw new Error("Error editing opinion");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSelectedOpinion(null);
    }
  };

  const handleOpinionClick = (opinion) => {
    setSelectedOpinion(opinion);
  };

  const handleDeleteOpinion = async (opinion) => {
    try {
      const response = await fetch(
        `${API_URL}/players/opinions/${opinion.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

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

  const handleTeamClick = () => {
    if (!playerData.team) {
      return;
    }
    navigate(`/teams/${playerData.team.id}/${playerData.team.name}`);
  };

  const closeOpinionForm = () => {
    setSelectedOpinion(null);
  };

  const opinionColumns = [
    { name: "Autor", isImage: false },
    { name: "Comentario", isImage: false },
    { name: "Puntuación", isImage: false },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <section className="player-home">
      <header className="player-header">
        <img
          src={playerData.foto + `?${new Date().getTime()}`}
          alt={`${playerData.nombre} foto`}
          className="player-picture"
          onError={(e) => {
            e.target.src = "/jugador.png";
          }}
        />
        <h1 className="player-name">{playerData.nombre}</h1>
        <h2
          className="player-team"
          onClick={() => handleTeamClick()}
          style={{ cursor: playerData.team ? "pointer" : "default" }}
        >
          {playerData.team ? `Equipo: ${playerData.team.name}` : "Sin equipo"}
        </h2>
        <div className="player-details">
          <span className="player-position">{playerData.posicion}</span>
          <span className="player-number">Número: {playerData.numero}</span>
        </div>
      </header>

      {error && <p className="error">{error}</p>}

      <div style={{ width: "60%" }}>
        <Table
          data={opinions}
          columns={opinionColumns}
          onRowClick={handleOpinionClick}
          redirect={true}
        />
      </div>

      <button className="add-opinion-btn" onClick={() => setIsModalOpen(true)}>
        OPINAR
      </button>

      <AddOpinionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <SeeOpinionModal
        item={selectedOpinion}
        onChange={setSelectedOpinion}
        onClose={closeOpinionForm}
        onSubmit={hanldeEditOpinion}
        onDelete={handleDeleteOpinion}
        whereTo={"players"}
        mode={"opinion"}
      />

      <div className="button-container">
        <AdminDeletePlayerModal playerData={playerData} />
        <AdminEditPlayerModal playerData={playerData} />
      </div>
    </section>
  );
}

function AdminDeletePlayerModal({ playerData }) {
  const { playerId } = useParams();
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("current_user"));
  const navigate = useNavigate();

  if (user.id !== ADMIN_ID) {
    return null;
  }

  const handleDeletePlayer = async () => {
    try {
      const response = await fetch(`${API_URL}/players/${playerId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Error deleting player");
      }
      
      setError("");
      closeModal();
    } catch (error) {
      console.error("Error al borrar el jugador:", error);
      setError("Error al  al borrar el jugador");
    }
    navigate(`/teams`);
  };

  const openModal = async () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
  };

  return (
    <>
      <button onClick={openModal} className="cancel-button" >Borrar jugador</button>

      {isModalOpen && (
        <div className="form-window-overlay">
          <div className="form-window">
            <h1>Borrar jugador</h1>
            <p>¿Estas seguro que quieres borrar a "{playerData.nombre}"?</p>
            <BasicForm
              onSubmit={handleDeletePlayer}
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

function AdminEditPlayerModal({ playerData }) {
  const [error, setError] = useState("");
  const { playerId } = useParams();
  const user = JSON.parse(localStorage.getItem("current_user"));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { supabase } = useSupabase();
  const [availableTeams, setAvailableTeams] = useState([]);
  const [fields, setFields] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user.id !== ADMIN_ID) {
    return null;
  }

  const fetchAvailableTeams = async () => {
    try {
      const response = await fetch(`${API_URL}/teams`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        const teams = await response.json();
        return teams.map((team) => ({ label: team.name, value: team.id }));
      } else {
        console.error("Error fetching teams");
        return [];
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      return [];
    }
  };

  const handleEditPlayer = async (formData) => {
    const { playerName, age, position, number, team } = formData;

    const json = {
      name: playerName,
      age: parseInt(age, 10),
      position: position,
      number: parseInt(number, 10),
      team_id: team,
    };

    try {
      const response = await fetch(`${API_URL}/players/${playerId}`, {
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
          await uploadPlayerImage(playerId, playerData);
        }
      } else {
        console.error("Error al editar el equipo:");
        throw new Error("Error adding Team");
      }
    } catch (error) {
      console.error("Error al editar el equipo:", error);
      setError("Error al editar el equipo");
    } finally {
      setError("");
      closeModal();
      navigate(`/teams/${playerData.team.name}/${playerId}/${playerName}`);
      window.location.reload();
    }
  };

  const uploadPlayerImage = async (playerId, playerData) => {
    if (!file) {
      setError("Por favor selecciona un archivo para subir");
      return;
    }
    try {
      if (playerData.foto !== null) {
        // EDIT
        await supabase.storage
          .from("player-pictures")
          .update(playerId, file, {
            metadata: {
              owner_id: user.id,
            },
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
        if (error) {
          throw new Error("Error updating Player Image");
        }
      } else {
        // POST
        await supabase.storage
          .from("player-pictures")
          .upload(`${playerId}`, file, {
            metadata: {
              owner_id: user.id,
            },
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
        if (error) {
          throw new Error("Error uploading Player Image");
        }
      }
    } catch (error) {
      setError("Error al cargar la imagen del jugador");
    }
  };

  const openModal = async () => {
    setLoading(true);

    const teams = await fetchAvailableTeams();

    setAvailableTeams(teams);

    setFields([
      {
        name: "playerName",
        label: "Nombre",
        value: playerData?.nombre || "",
        required: false,
      },
      {
        name: "age",
        label: "Edad",
        value: playerData?.edad || "",
        required: false,
      },
      {
        name: "position",
        label: "Posicion",
        value: playerData?.posicion || "",
        required: false,
      },
      {
        name: "number",
        label: "Numero",
        value: playerData?.numero || "",
        required: false,
      },
      {
        name: "team",
        label: "Equipo",
        value: playerData?.team?.id || "",
        type: "dropdown",
        options: teams,
        required: false,
      },
      { name: "foto", label: "Seleccionar foto", required: false },
    ]);
    setLoading(false);

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFile(null);
    setError("");
  };

  return (
    <>
      <button onClick={openModal}>Editar Jugador</button>

      {isModalOpen && (
        <div className="form-window-overlay">
          <div className="form-window">
            <h1>Editar Jugador</h1>
            {loading ? (
              <p>Cargando equipos...</p>
            ) : (
              <BasicForm
                fields={fields}
                onSubmit={handleEditPlayer}
                onCancel={closeModal}
                setFile={setFile}
              />
            )}
            {error && <p className="error">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}

export default PlayerPage;
