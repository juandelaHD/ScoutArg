import React from 'react';
import './header.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import ProfileMenu from '../profileMenu/profileMenu';
import { Link } from 'react-router-dom';

const Header = () => {
    const user = JSON.parse(localStorage.getItem('current_user_data'));

    return (
        <header className="header">
            <div className="logo-container-header">
                <Link to="/teams">
                    <img 
                        src="/ScoutArg.png"
                        alt="Logo" 
                        className="logo" 
                    /> 
                </Link>
            </div>
            <div className="user-info">
                <FontAwesomeIcon icon={faUser}/>
                {user.name}
                <ProfileMenu />
            </div>
        </header>
    );
}

export default Header;
