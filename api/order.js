import handler from "../libs/handler-lib";
import { success } from "../libs/response-lib";
import dynamoDb from "../libs/dynamodb-lib";

import * as uuid from "uuid";

//const TABLE_NAME = process.env.tableName;

export const getOrders = handler(async (event) => {
  const PK = `USER#${event.requestContext.identity.cognitoIdentityId}`;
  const params = {
    TableName: process.env.tableName,
    KeyConditionExpression: "PK = :PK and begins_with(SK, :SK)",
    ExpressionAttributeValues: {
      ":PK": PK,
      ":SK": "ORDER#"
    }
  };
  const result = await dynamoDb.query(params);
  return result.Items;
});

export const createOrder = handler(async (event) => {
  const body = JSON.parse(event.body);
  const PK = `USER#${event.requestContext.identity.cognitoIdentityId}`;
  const cardItem = {
    state: "PLACED",
    items: body.items
  };
  cardItem.PK = PK;
  cardItem.SK = `ORDER#${uuid.v1()}`;
  cardItem.createdAt = Date.now();
  const params = {
    TableName: process.env.tableName,
    Item: cardItem
  };
  await dynamoDb.put(params);
  return success(params.Item);
});

export const deleteOrder  = handler(async (event) => {
  const body = JSON.parse(event.body);
  const order = body.oderId;
  const PK = `USER#${event.requestContext.identity.cognitoIdentityId}`;
  const params = {
    TableName: process.env.tableName,
    Key: {
      PK: PK,
      SK: order
    }
  };
  const result = await dynamoDb.delete(params);
  return success(result);
});