require("dotenv").config();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// Cấu hình AWS
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'Products';

module.exports = {
  // Lấy tất cả sản phẩmconfirm
  async getAllProducts() {
    const command = new ScanCommand({
      TableName: TABLE_NAME
    });
    const response = await docClient.send(command);
    return response.Items || [];
  },

  // Lấy sản phẩm theo ID
  async getProductById(id) {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    });
    const response = await docClient.send(command);
    return response.Item;
  },

  // Thêm sản phẩm mới
  async createProduct(product) {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: product
    });
    await docClient.send(command);
    return product;
  },

  // Cập nhật sản phẩm
  async updateProduct(id, name, price, quantity, imageUrl) {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET #name = :name, price = :price, quantity = :quantity, imageUrl = :imageUrl, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':price': parseFloat(price),
        ':quantity': parseInt(quantity),
        ':imageUrl': imageUrl,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    });
    const response = await docClient.send(command);
    return response.Attributes;
  },

  // Xóa sản phẩm
  async deleteProduct(id) {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id }
    });
    await docClient.send(command);
  }
};
