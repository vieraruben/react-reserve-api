import handler from "../libs/handler-lib";
import { success } from "../libs/response-lib";
import dynamoDb from "../libs/dynamodb-lib";

import * as uuid from "uuid";

//const TABLE_NAME = process.env.tableName;

export const getCardInfo = handler(async (event) => {
  const PK = `USER#${event.requestContext.identity.cognitoIdentityId}`;
  const params = {
    TableName: process.env.tableName,
    KeyConditionExpression: "PK = :PK and begins_with(SK, :SK)",
    ExpressionAttributeValues: {
      ":PK": PK,
      ":SK": "CARD#"
    }
  };
  const result = await dynamoDb.query(params);
  return result.Items;
});

export const createCardItem = handler(async (event) => {
  const body = JSON.parse(event.body);
  const PK = `USER#${event.requestContext.identity.cognitoIdentityId}`;
  const cardItem = {
    title: body.title,
    sku: body.sku,
    price: body.price,
    quantity: body.quantity,
    url: body.url
  };
  cardItem.PK = PK;
  cardItem.SK = `CARD#${uuid.v1()}`;
  cardItem.createdAt = Date.now();
  const params = {
    TableName: process.env.tableName,
    Item: cardItem
  };
  await dynamoDb.put(params);
  return success(params.Item);
});

export const deleteCardItem  = handler(async (event) => {
  const body = JSON.parse(event.body);
  const cardId = body.cardId;
  const PK = `USER#${event.requestContext.identity.cognitoIdentityId}`;
  const params = {
    TableName: process.env.tableName,
    Key: {
      PK: PK,
      SK: cardId
    }
  };
  const result = await dynamoDb.delete(params);
  return success(result.Item);
});

export const clearCard  = handler(async (event) => {
  const PK = `USER#${event.requestContext.identity.cognitoIdentityId}`;
  const params = {
    TableName: process.env.tableName,
    KeyConditionExpression: "PK = :PK and begins_with(SK, :SK)",
    ExpressionAttributeValues: {
      ":PK": PK,
      ":SK": "CARD#"
    }
  };
  const result = await dynamoDb.query(params);
  for (let index = 0; index < result.Items.length; index++) {
    await dynamoDb.delete({
      TableName: process.env.tableName,
      Key: {
        PK: PK,
        SK: result.Items[index].SK
      }
    });
  }
  return success("Card is empty!");
});