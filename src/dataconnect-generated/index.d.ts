import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

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

interface CreateCommunityRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCommunityVariables): MutationRef<CreateCommunityData, CreateCommunityVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCommunityVariables): MutationRef<CreateCommunityData, CreateCommunityVariables>;
  operationName: string;
}
export const createCommunityRef: CreateCommunityRef;

export function createCommunity(vars: CreateCommunityVariables): MutationPromise<CreateCommunityData, CreateCommunityVariables>;
export function createCommunity(dc: DataConnect, vars: CreateCommunityVariables): MutationPromise<CreateCommunityData, CreateCommunityVariables>;

interface GetCommunityBySlugRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCommunityBySlugVariables): QueryRef<GetCommunityBySlugData, GetCommunityBySlugVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCommunityBySlugVariables): QueryRef<GetCommunityBySlugData, GetCommunityBySlugVariables>;
  operationName: string;
}
export const getCommunityBySlugRef: GetCommunityBySlugRef;

export function getCommunityBySlug(vars: GetCommunityBySlugVariables): QueryPromise<GetCommunityBySlugData, GetCommunityBySlugVariables>;
export function getCommunityBySlug(dc: DataConnect, vars: GetCommunityBySlugVariables): QueryPromise<GetCommunityBySlugData, GetCommunityBySlugVariables>;

interface CreatePostRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePostVariables): MutationRef<CreatePostData, CreatePostVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePostVariables): MutationRef<CreatePostData, CreatePostVariables>;
  operationName: string;
}
export const createPostRef: CreatePostRef;

export function createPost(vars: CreatePostVariables): MutationPromise<CreatePostData, CreatePostVariables>;
export function createPost(dc: DataConnect, vars: CreatePostVariables): MutationPromise<CreatePostData, CreatePostVariables>;

interface ListPostsByCommunityRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPostsByCommunityVariables): QueryRef<ListPostsByCommunityData, ListPostsByCommunityVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListPostsByCommunityVariables): QueryRef<ListPostsByCommunityData, ListPostsByCommunityVariables>;
  operationName: string;
}
export const listPostsByCommunityRef: ListPostsByCommunityRef;

export function listPostsByCommunity(vars: ListPostsByCommunityVariables): QueryPromise<ListPostsByCommunityData, ListPostsByCommunityVariables>;
export function listPostsByCommunity(dc: DataConnect, vars: ListPostsByCommunityVariables): QueryPromise<ListPostsByCommunityData, ListPostsByCommunityVariables>;

