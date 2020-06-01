import handler from "../libs/handler-lib";
import { success } from "../libs/response-lib";
import dynamoDb from "../libs/dynamodb-lib";

import * as uuid from "uuid";

//const TABLE_NAME = process.env.tableName;

export const getProducts = handler(async (event) => {
  const params = {
    TableName: process.env.tableName,
    KeyConditionExpression: "PK = :PK",
    ExpressionAttributeValues: {
      ":PK": "PRODUCT"
    }
  };
  const result = await dynamoDb.query(params);
  return result.Items;
});

export const createProduct = handler(async (event) => {
  const body = JSON.parse(event.body);
  const cardItem = {
    title: body.title,
    url: body.url,
    price: body.price
  };
  cardItem.PK = "PRODUCT";
  cardItem.SK = uuid.v1();
  cardItem.createdAt = Date.now();
  const params = {
    TableName: process.env.tableName,
    Item: cardItem
  };
  await dynamoDb.put(params);
  return success(params.Item);
});

export const deleteProduct  = handler(async (event) => {
  const body = JSON.parse(event.body);
  const productID = body.productID;
  const params = {
    TableName: process.env.tableName,
    Key: {
      PK: "PRODUCT",
      SK: productID
    }
  };
  const result = await dynamoDb.delete(params);
  return success(result);
});