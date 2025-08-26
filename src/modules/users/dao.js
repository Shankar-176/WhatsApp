const { executeQuery } = require('../../config/db');

const searchUsers = async (searchTerm, currentUserId, limit, offset) => {
  let query = `
    SELECT id, username, email, profile_picture, bio, is_online, last_seen, created_at
    FROM users 
    WHERE id != ?
  `;
  
  const params = [currentUserId];

  if (searchTerm) {
    query += ` AND (username LIKE ? OR email LIKE ?)`;
    const searchPattern = `%${searchTerm}%`;
    params.push(searchPattern, searchPattern);
  }

  query += ` ORDER BY username ASC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const results = await executeQuery(query, params);
  return results;
};

const getUsersCount = async (searchTerm, currentUserId) => {
  let query = `
    SELECT COUNT(*) as count
    FROM users 
    WHERE id != ?
  `;
  
  const params = [currentUserId];

  if (searchTerm) {
    query += ` AND (username LIKE ? OR email LIKE ?)`;
    const searchPattern = `%${searchTerm}%`;
    params.push(searchPattern, searchPattern);
  }

  const results = await executeQuery(query, params);
  return results[0].count;
};

const findUserById = async (id) => {
  const query = `
    SELECT * FROM users 
    WHERE id = ?
    LIMIT 1
  `;
  const results = await executeQuery(query, [id]);
  return results[0] || null;
};

const findUserByUsername = async (username) => {
  const query = `
    SELECT * FROM users 
    WHERE username = ?
    LIMIT 1
  `;
  const results = await executeQuery(query, [username]);
  return results[0] || null;
};

const updateUserProfile = async (userId, updateData) => {
  const fields = [];
  const params = [];

  if (updateData.username !== undefined) {
    fields.push('username = ?');
    params.push(updateData.username);
  }

  if (updateData.bio !== undefined) {
    fields.push('bio = ?');
    params.push(updateData.bio);
  }

  if (updateData.profile_picture !== undefined) {
    fields.push('profile_picture = ?');
    params.push(updateData.profile_picture);
  }

  if (fields.length === 0) {
    return; // Nothing to update
  }

  fields.push('updated_at = NOW()');
  params.push(userId);

  const query = `
    UPDATE users 
    SET ${fields.join(', ')}
    WHERE id = ?
  `;

  await executeQuery(query, params);
};

const updateUserOnlineStatus = async (userId, isOnline) => {
  const query = `
    UPDATE users 
    SET is_online = ?, last_seen = NOW(), updated_at = NOW()
    WHERE id = ?
  `;
  
  await executeQuery(query, [isOnline ? 1 : 0, userId]);
};

module.exports = {
  searchUsers,
  getUsersCount,
  findUserById,
  findUserByUsername,
  updateUserProfile,
  updateUserOnlineStatus
};  