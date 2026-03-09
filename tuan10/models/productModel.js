const { dynamo } = require("../config/aws");

const TABLE = process.env.DYNAMODB_TABLE;

const getAll = async () => {
  const params = { TableName: TABLE };
  const data = await dynamo.scan(params).promise();
  return data.Items;
};

const create = async (product) => {
  const params = {
    TableName: TABLE,
    Item: product
  };
  return dynamo.put(params).promise();
};

const remove = async (id) => {
  const params = {
    TableName: TABLE,
    Key: { id: id }   // FIX
  };
  return dynamo.delete(params).promise();
};

const getById = async (id) => {
  const params = {
    TableName: TABLE,
    Key: { id: id }   // FIX
  };
  const data = await dynamo.get(params).promise();
  return data.Item;
};

const update = async (product) => {
  const params = {
    TableName: TABLE,
    Item: product
  };
  return dynamo.put(params).promise();
};

module.exports = { getAll, create, remove, getById, update };