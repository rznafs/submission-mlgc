const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData')
 
async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;
 
  const { confidenceScore, label, suggestion } = await predictClassification(model, image);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
 
  const data = {
    "id": id,
    "result": label,
    "suggestion": suggestion,
    "createdAt": createdAt
  }

  await storeData(id, data);
 
  const response = h.response({
    status: 'success',
    message: 'Model is predicted successfully',
    data,
  })
  response.code(201);
  return response;
}

async function predictHistories(request, h) {
    const { model } = request.server.app;
    const { Firestore } = require('@google-cloud/firestore');

    const db = new Firestore();
    const predictCollection = db.collection('predictions');
    const snapshot = await predictCollection.get();
    const result = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        result.push({
            id: doc.id,
            history: {
                result: data.result,
                createdAt: data.createdAt,
                suggestion: data.suggestion,
                id: doc.id,
            }
        });
    });
    return h.response({
        status: "success",
        data: result,
    });
}
 
module.exports = { postPredictHandler, predictHistories };