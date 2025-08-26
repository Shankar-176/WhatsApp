const { executeQuery } = require('../../config/db');

const getRecentChats = async (userId) => {
  const query = `
    SELECT rc.*, 
           u1.username as user1_username,
           u2.username as user2_username
    FROM recent_chats rc
    LEFT JOIN users u1 ON rc.user1_id = u1.id
    LEFT JOIN users u2 ON rc.user2_id = u2.id
    WHERE rc.user1_id = ? OR rc.user2_id = ?
    ORDER BY rc.last_message_time DESC
  `;
  
  const results = await executeQuery(query, [userId, userId]);
  return results;
};

const getMessages = async (userId1, userId2, cursor, limit) => {
  let query = `
    SELECT * FROM messages 
    WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
    AND is_deleted = 0
  `;
  
  const params = [userId1, userId2, userId2, userId1];

  if (cursor) {
    query += ` AND created_at < ?`;
    params.push(cursor);
  }

  query += ` ORDER BY created_at DESC LIMIT ?`;
  params.push(limit);

  const results = await executeQuery(query, params);
  return results.reverse(); // Return in chronological order
};

const createMessage = async (messageData) => {
  const { sender_id, receiver_id, message_type, message_text, message_image } = messageData;
  
  const query = `
    INSERT INTO messages (sender_id, receiver_id, message_type, message_text, message_image)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const result = await executeQuery(query, [
    sender_id, 
    receiver_id, 
    message_type, 
    message_text, 
    message_image
  ]);
  
  return result.insertId;
};

const getMessageById = async (messageId) => {
  const query = `
    SELECT * FROM messages 
    WHERE id = ?
    LIMIT 1
  `;
  
  const results = await executeQuery(query, [messageId]);
  return results[0] || null;
};

const updateMessage = async (messageId, updateData) => {
  const fields = [];
  const params = [];

  if (updateData.message_text !== undefined) {
    fields.push('message_text = ?');
    params.push(updateData.message_text);
  }

  if (updateData.message_image !== undefined) {
    fields.push('message_image = ?');
    params.push(updateData.message_image);
  }

  if (updateData.is_edited !== undefined) {
    fields.push('is_edited = ?');
    params.push(updateData.is_edited);
  }

  if (updateData.is_deleted !== undefined) {
    fields.push('is_deleted = ?');
    params.push(updateData.is_deleted);
  }

  if (updateData.status !== undefined) {
    fields.push('status = ?');
    params.push(updateData.status);
  }

  if (fields.length === 0) {
    return; // Nothing to update
  }

  fields.push('updated_at = NOW()');
  params.push(messageId);

  const query = `
    UPDATE messages 
    SET ${fields.join(', ')}
    WHERE id = ?
  `;

  await executeQuery(query, params);
};

const upsertRecentChat = async (chatData) => {
  const { user1_id, user2_id, last_message_text, last_message_type, last_message_time } = chatData;
  
  const query = `
    INSERT INTO recent_chats (user1_id, user2_id, last_message_text, last_message_type, last_message_time)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    last_message_text = VALUES(last_message_text),
    last_message_type = VALUES(last_message_type),
    last_message_time = VALUES(last_message_time),
    updated_at = NOW()
  `;
  
  await executeQuery(query, [
    user1_id, 
    user2_id, 
    last_message_text, 
    last_message_type, 
    last_message_time
  ]);
};

const markMessagesAsSeen = async (fromUserId, toUserId) => {
  const query = `
    UPDATE messages 
    SET status = 'seen', updated_at = NOW()
    WHERE sender_id = ? AND receiver_id = ? AND status != 'seen'
  `;
  
  await executeQuery(query, [fromUserId, toUserId]);
};

const getUnreadMessagesCount = async (userId) => {
  const query = `
    SELECT COUNT(*) as count
    FROM messages 
    WHERE receiver_id = ? AND status != 'seen' AND is_deleted = 0
  `;
  
  const results = await executeQuery(query, [userId]);
  return results[0].count;
};

module.exports = {
  getRecentChats,
  getMessages,
  createMessage,
  getMessageById,
  updateMessage,
  upsertRecentChat,
  markMessagesAsSeen,
  getUnreadMessagesCount
};