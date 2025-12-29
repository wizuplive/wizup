import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface Comment_Key {
  id: UUIDString;
  __typename?: 'Comment_Key';
}

export interface Community_Key {
  id: UUIDString;
  __typename?: 'Community_Key';
}

export interface CreateCommunityData {
  community_insert: Community_Key;
}

export interface CreateCommunityVariables {
  name: string;
  slug: string;
  description: string;
  rules: string;
  welcomeMessage: string;
  bannerImageURL?: string | null;
}

export interface CreatePostData {
  post_insert: Post_Key;
}

export interface CreatePostVariables {
  communityId: UUIDString;
  title?: string | null;
  content: string;
  mediaURL?: string | null;
  postType?: string | null;
}

export interface GetCommunityBySlugData {
  communities: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    rules?: string | null;
    welcomeMessage?: string | null;
    bannerImageURL?: string | null;
    creator: {
      id: UUIDString;
      username: string;
      displayName?: string | null;
      profilePictureURL?: string | null;
    } & User_Key;
  } & Community_Key)[];
}

export interface GetCommunityBySlugVariables {
  slug: string;
}

export interface ListPostsByCommunityData {
  posts: ({
    id: UUIDString;
    title?: string | null;
    content: string;
    mediaURL?: string | null;
    postType?: string | null;
    author: {
      id: UUIDString;
      username: string;
      displayName?: string | null;
      profilePictureURL?: string | null;
    } & User_Key;
  } & Post_Key)[];
}

export interface ListPostsByCommunityVariables {
  communityId: UUIDString;
}

export interface Membership_Key {
  userId: UUIDString;
  communityId: UUIDString;
  __typename?: 'Membership_Key';
}

export interface Post_Key {
  id: UUIDString;
  __typename?: 'Post_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'CreateCommunity' Mutation. Allow users to execute without passing in DataConnect. */
export function createCommunity(dc: DataConnect, vars: CreateCommunityVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCommunityData>>;
/** Generated Node Admin SDK operation action function for the 'CreateCommunity' Mutation. Allow users to pass in custom DataConnect instances. */
export function createCommunity(vars: CreateCommunityVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCommunityData>>;

/** Generated Node Admin SDK operation action function for the 'GetCommunityBySlug' Query. Allow users to execute without passing in DataConnect. */
export function getCommunityBySlug(dc: DataConnect, vars: GetCommunityBySlugVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetCommunityBySlugData>>;
/** Generated Node Admin SDK operation action function for the 'GetCommunityBySlug' Query. Allow users to pass in custom DataConnect instances. */
export function getCommunityBySlug(vars: GetCommunityBySlugVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetCommunityBySlugData>>;

/** Generated Node Admin SDK operation action function for the 'CreatePost' Mutation. Allow users to execute without passing in DataConnect. */
export function createPost(dc: DataConnect, vars: CreatePostVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreatePostData>>;
/** Generated Node Admin SDK operation action function for the 'CreatePost' Mutation. Allow users to pass in custom DataConnect instances. */
export function createPost(vars: CreatePostVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreatePostData>>;

/** Generated Node Admin SDK operation action function for the 'ListPostsByCommunity' Query. Allow users to execute without passing in DataConnect. */
export function listPostsByCommunity(dc: DataConnect, vars: ListPostsByCommunityVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListPostsByCommunityData>>;
/** Generated Node Admin SDK operation action function for the 'ListPostsByCommunity' Query. Allow users to pass in custom DataConnect instances. */
export function listPostsByCommunity(vars: ListPostsByCommunityVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListPostsByCommunityData>>;

