// src/routes/api/get.js

const { createSuccessResponse } = require('../../response');
const { getShoes } = require('../../database/database');
const logger = require('../../logger');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  let allshoes = [];

  try {
    allshoes = await getShoes();

    if (!allshoes) throw new Error('No shoes found');
  } catch (err) {
    logger.error(err);
  }

  const data = createSuccessResponse({ shoes: allshoes });

  logger.info('Created the success response');

  res.status(200).json({
    ...data,
  });
};
