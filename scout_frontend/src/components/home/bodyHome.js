import React, { useEffect, useState } from 'react';
import Table from '../table/table';
import SearchBar from '../searchBar/searchBar';
import { useNavigate } from 'react-router-dom';
import './bodyHome.css';
import { API_URL, ADMIN_ID } from '../../utils';
import LoadingSpinner from '../loadingSpinner/loadingSpinner';
import { useSupabase } from '../../supabaseContext';
import BasicForm from '../basicForm/basicForm';

function BodyHome() {
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [selectedOption, setSelectedOption] = useState('Equipos');
    const [teamSearch, setTeamSearch] = useState('')
    const [playerSearch, setPlayerSearch] = useState('')
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { supabase } = useSupabase();

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/teams`);
            if (!response.ok) {
                throw new Error('Error al obtener los equipos');
            }
            const data = await response.json();
            const formattedTeams = await Promise.all(data.map(async (team) => {
                const { data: imageData } = await supabase.storage
                    .from("team-pictures")
                    .getPublicUrl(team.id);
                
                return {
                    escudo: imageData.publicUrl,
                    nombre: team.name,
                    team_id: team.id,
                };
            }));

            setTeams(formattedTeams);
            setFilteredTeams(formattedTeams);
        } catch (error) {
            console.error('Error fetching teams:', error);
        } finally {
            setTeamSearch('');
            setLoading(false);
        }
    };

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/players`);
            if (!response.ok) {
                throw new Error('Error al obtener los jugadores');
            }
            const playerData = await response.json();
            const formattedPlayers = await Promise.all(playerData.map(async (player) => {
                const { data: imageData } = await supabase.storage
                        .from("player-pictures")
                        .getPublicUrl(player.id);

                return {
                    edad: player.age,
                    nombre: player.name,
                    numero: player.number,
                    posicion: player.position,
                    id: player.id,
                    team: player.team,
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

    useEffect(() => {
        fetchTeams();
        fetchPlayers();
    }, []);

    const handleTeamSearch = (query) => {
        setTeamSearch(query);
        const filtered = teams.filter(team => team.nombre.toLowerCase().includes(query.toLowerCase()));
        setFilteredTeams(filtered);
    };

    const handlePlayerSearch = (query) => {
        setPlayerSearch(query);
        const filtered = players.filter(player => player.nombre.toLowerCase().includes(query.toLowerCase()));
        setFilteredPlayers(filtered);
    };

    const handleTeamClick = (team) => {
        navigate(`/teams/${team.team_id}/${team.nombre}`);
    };

    const handlePlayerClick = (player) => {
        if (player.team) {
            navigate(`/teams/${player.team.name}/${player.id}/${player.nombre}`);
        } else {
            navigate(`/teams/No%20Asignado/${player.id}/${player.nombre}`);
        }
    };

    const teamColumns = [
        { name: 'Escudo', isImage: true },
        { name: 'Nombre', isImage: false }
    ];
    const playerColumns = [
        { name: "Foto", isImage: true },
        { name: "Nombre", isImage: false },
        { name: "Posicion", isImage: false },
        { name: "Numero", isImage: false },
        { name: "Edad", isImage: false },
        { name: "Equipo", isImage: false },
    ];

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <section className="body-home">
            <header className="body-header">
            </header>
            <div className="display-table-options">
                <button
                    className={`display-table-option ${selectedOption === 'Equipos' ? '' : 'active'}`}
                    onClick={() => setSelectedOption('Equipos')}
                >
                    Equipos
                </button>
                <button
                    className={`display-table-option ${selectedOption === 'Jugadores' ? '' : 'active'}`}
                    onClick={() => setSelectedOption('Jugadores')}
                >
                    Jugadores
                </button>
            </div>
            {selectedOption === 'Equipos' && (
            <>
                <SearchBar 
                    placeholder="Buscar equipo..." 
                    value={teamSearch} 
                    onSearch={handleTeamSearch} 
                />
                <div style={{width: "60%"}}>
                    <Table 
                        data={filteredTeams} 
                        columns={teamColumns} 
                        onRowClick={handleTeamClick} 
                        onImageError={(e) => { e.target.src = '/logo512.png'; }}
                        redirect={true}
                    />
                </div>
                <AdminAddTeamModal fetchTeams={fetchTeams} />
            </>
            )}
            {selectedOption === 'Jugadores' && (
            <>
                <SearchBar 
                    placeholder="Buscar jugador..." 
                    value={playerSearch} 
                    onSearch={handlePlayerSearch} 
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
                <AdminAddPlayerModal fetchPlayers={fetchPlayers} />
            </>
            )}
        </section>
    );
}

function AdminAddTeamModal({ fetchTeams }) {
    const [error, setError] = useState('');
    const user = JSON.parse(localStorage.getItem('current_user'));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { supabase } = useSupabase();
    const [file, setFile] = useState(null);

    if (user.id !== ADMIN_ID) {
        return null;
    }

    const uploadTeamImage = async (teamId) => {
        if (!file) {
            setError('Por favor selecciona un archivo para subir');
            return;
        }

        try {
            await supabase.storage
                .from('team-pictures')
                .upload(`${teamId}`, file, {
                    metadata: {
                        owner_id: user.id,
                    },
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
        } catch (error) {
            setError('Error al cargar la imagen del equipo');
        }
    };

    const handleAddTeam = async (formData) => {
        const { teamName } = formData;

        const json = {
            name: teamName,
        };

        try {
            const response = await fetch(`${API_URL}/teams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify(json),
            });

            if (response.ok) {
                const team = await response.json();
                await fetchTeams();
                await uploadTeamImage(team.id);
                setError('');
                closeModal();
            } else {
                throw new Error('Error adding Team');
            }
        } catch (error) {
            console.error('Error al crear el equipo:', error);
            setError('Error al crear el equipo');
        }
    };

    const fields = [
        { name: 'teamName', label: 'Nombre del equipo', required: true },
        { name: 'foto', label: 'Seleccionar escudo', required: true },
    ];

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setFile(null);
        setError('');
    };

    return (
        <>
            <button className="add-team-button" onClick={openModal}>Agregar Equipo</button>

            {isModalOpen && (
                <div className="form-window-overlay">
                    <div className="form-window">
                        <h1>Agregar nuevo equipo</h1>
                        <BasicForm 
                            fields={fields} 
                            onSubmit={handleAddTeam} 
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

function AdminAddPlayerModal({ fetchPlayers }) {
    const [error, setError] = useState("");
    const user = JSON.parse(localStorage.getItem("current_user"));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { supabase } = useSupabase();
    const [file, setFile] = useState(null);
  
    if (user.id !== ADMIN_ID) {
      return null;
    }
  
    const uploadPlayerImage = async (playerId) => {
        if (!file) {
            setError("Por favor selecciona un archivo para subir");
            return;
        }
    
        try {
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
        } catch (error) {
            setError("Error al cargar la imagen del equipo");
        }
    };
  
    const handleAddPlayer = async (formData) => {
        const { playerName, age, position, number } = formData;
    
        const json = {
            name: playerName,
            age: parseInt(age, 10),
            position,
            number: parseInt(number, 10),
            team_id: null,
        };
    
        try {
            const response = await fetch(`${API_URL}/players`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
            },
                body: JSON.stringify(json),
            });
    
            if (response.ok) {
            const player = await response.json();
                await fetchPlayers();
                await uploadPlayerImage(player.id);
                setError("");
                closeModal();
            } else {
                throw new Error("Error adding Player");
            }
        } catch (error) {
            console.error("Error al agregar el jugador:", error);
            setError("Error al agregar el jugador");
        }
    };
  
    const fields = [
        { name: "playerName", label: "Nombre", required: true },
        { name: "age", label: "Edad", required: true },
        { name: "position", label: "Posicion", required: true },
        { name: "number", label: "Numero", required: true },
        { name: "foto", label: "Seleccionar foto", required: true },
    ];
  
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setFile(null);
        setError("");
    };
  
    return (
        <>
            <button onClick={openModal}>Agregar Jugador</button>
    
            {isModalOpen && (
                <div className="form-window-overlay">
                    <div className="form-window">
                        <h1>Agregar nuevo jugador</h1>
                        <BasicForm 
                            fields={fields} 
                            onSubmit={handleAddPlayer} 
                            onCancel={closeModal} 
                            setImage={true}
                            setFile={setFile}
                        />
                        {error && <p className="error">{error}</p>}
                    </div>
                </div>
            )}
        </>
      );
}

export default BodyHome;
