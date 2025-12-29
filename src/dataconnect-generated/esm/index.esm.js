import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'wizup',
  location: 'us-east4'
};

export const createCommunityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCommunity', inputVars);
}
createCommunityRef.operationName = 'CreateCommunity';

export function createCommunity(dcOrVars, vars) {
  return executeMutation(createCommunityRef(dcOrVars, vars));
}

export const getCommunityBySlugRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCommunityBySlug', inputVars);
}
getCommunityBySlugRef.operationName = 'GetCommunityBySlug';

export function getCommunityBySlug(dcOrVars, vars) {
  return executeQuery(getCommunityBySlugRef(dcOrVars, vars));
}

export const createPostRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePost', inputVars);
}
createPostRef.operationName = 'CreatePost';

export function createPost(dcOrVars, vars) {
  return executeMutation(createPostRef(dcOrVars, vars));
}

export const listPostsByCommunityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPostsByCommunity', inputVars);
}
listPostsByCommunityRef.operationName = 'ListPostsByCommunity';

export function listPostsByCommunity(dcOrVars, vars) {
  return executeQuery(listPostsByCommunityRef(dcOrVars, vars));
}

