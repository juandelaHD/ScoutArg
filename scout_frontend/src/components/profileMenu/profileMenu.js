import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import './profileMenu.css'
import { useSupabase } from '../../supabaseContext';

function ProfileMenu() {
    const { logout } = useSupabase();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogOut = async () => {
        logout();
        navigate('/');
    };

    return (
        <>
            <button onClick={toggleMenu} className="menu-button">
                <FontAwesomeIcon icon={faEllipsis} />
            </button>
            {isMenuOpen && (
                <div className="menu-dropdown">
                    <button onClick={handleLogOut} className="menu-item">LogOut</button>
                </div>
            )}
        </>
    );
}

export default ProfileMenu;