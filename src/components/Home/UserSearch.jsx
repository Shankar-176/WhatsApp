import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers } from '../../store/userSlice';
import { setSearchQuery } from '../../store/userSlice';

const UserSearch = () => {
  const dispatch = useDispatch();
  const { searchQuery } = useSelector((state) => state.user);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localQuery !== searchQuery) {
        dispatch(setSearchQuery(localQuery));
        dispatch(fetchAllUsers(localQuery));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localQuery, searchQuery, dispatch]);

  const handleInputChange = (e) => {
    setLocalQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    dispatch(setSearchQuery(''));
    dispatch(fetchAllUsers(''));
  };

  return (
    <div className="position-relative">
      <Form.Control
        type="text"
        placeholder="Search users..."
        value={localQuery}
        onChange={handleInputChange}
        className="search-input pe-4"
      />
      <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
        {localQuery ? (
          <button
            type="button"
            className="btn btn-sm p-0 border-0 bg-transparent text-muted"
            onClick={handleClearSearch}
            aria-label="Clear search"
          >
            <i className="bi bi-x-circle"></i>
          </button>
        ) : (
          <i className="bi bi-search text-muted"></i>
        )}
      </div>
    </div>
  );
};

export default UserSearch;