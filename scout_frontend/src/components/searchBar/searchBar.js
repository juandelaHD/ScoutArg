import './searchBar.css';

function SearchBar({ placeholder, value, onSearch }) {
    return (
        <div className="search-bar-container">
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onSearch(e.target.value)}
                className="search-bar"
            />
        </div>
    );
}

export default SearchBar;
