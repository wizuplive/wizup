const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'wizup',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createCommunityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCommunity', inputVars);
}
createCommunityRef.operationName = 'CreateCommunity';
exports.createCommunityRef = createCommunityRef;

exports.createCommunity = function createCommunity(dcOrVars, vars) {
  return executeMutation(createCommunityRef(dcOrVars, vars));
};

const getCommunityBySlugRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCommunityBySlug', inputVars);
}
getCommunityBySlugRef.operationName = 'GetCommunityBySlug';
exports.getCommunityBySlugRef = getCommunityBySlugRef;

exports.getCommunityBySlug = function getCommunityBySlug(dcOrVars, vars) {
  return executeQuery(getCommunityBySlugRef(dcOrVars, vars));
};

const createPostRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePost', inputVars);
}
createPostRef.operationName = 'CreatePost';
exports.createPostRef = createPostRef;

exports.createPost = function createPost(dcOrVars, vars) {
  return executeMutation(createPostRef(dcOrVars, vars));
};

const listPostsByCommunityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPostsByCommunity', inputVars);
}
listPostsByCommunityRef.operationName = 'ListPostsByCommunity';
exports.listPostsByCommunityRef = listPostsByCommunityRef;

exports.listPostsByCommunity = function listPostsByCommunity(dcOrVars, vars) {
  return executeQuery(listPostsByCommunityRef(dcOrVars, vars));
};
